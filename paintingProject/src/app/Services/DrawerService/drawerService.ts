import { fabric } from 'fabric';
import { CircleDrawer } from './circleDrawerService';
import { LineDrawer } from './lineDrawerService';
import { RectDrawer } from './rectDrawerService';
import {
  BorderColor,
  ChangeObjectProperty,
  CornerSize,
  CursorMode,
  DrawingMode,
  IObjectDrawer,
  ObjectType,
} from './types';

/*
  The function for this service is to:
  Create new objects or modify existing objects
*/
export class DrawingEditor {
  canvas: fabric.Canvas;
  public _drawer: IObjectDrawer; //Current drawer
  private cursorMode: CursorMode = CursorMode.Draw; //the cursorMode is select by user interaction, we can add by default is draw line
  private drawerOptions: fabric.IObjectOptions; //Current drawer options
  private readonly drawers: IObjectDrawer[]; //All possible drawers
  private object: fabric.Object; //The object currently being drawn
  private isDown: boolean; //Is user dragging the mouse?

  constructor(canvas: fabric.Canvas) {
    //Create the Fabric canvas
    this.canvas = canvas;

    //Create a collection of all possible "drawer" classes
    this.drawers = [new LineDrawer(), new RectDrawer(), new CircleDrawer()];

    //Set the default options for the "drawer" class, including
    //stroke color, width, and style
    this.drawerOptions = {
      stroke: 'black',
      strokeWidth: 1,
      selectable: false, //creating by default is non selectable
      strokeUniform: true,
      hasControls: false, // the control for change the width, height rotation
      hasBorders: false, // has selection border
      borderColor: BorderColor.xxxlight,
      cornerColor: BorderColor.xxlight,
      transparentCorners: false,
      cornerSize: CornerSize.desktop,
      fill: undefined,
      hoverCursor: 'default',
    };

    this.isDown = false; //To start, user is NOT dragging the mouse
    this.initializeCanvasEvents();
    this.setDrawingTool(DrawingMode.Line);
  }

  // ---- need to add validations for the input value ---//
  //Change the color for the current selection
  public setDrawingColor(color: string) {
    this.drawerOptions.stroke = color;
    if (this.cursorMode == CursorMode.Select) {
      this.canvas.getActiveObjects().forEach(async (obj) => {
        await this._drawer.changeProperty(
          obj,
          ChangeObjectProperty.StrokeColor,
          color
        );
      });
      this.canvas.renderAll();
    }
  }

  // ---- need to add validations for the input value ---//
  //Change the width for the current selection
  public setDrawingWeight(weight: number) {
    if (this.cursorMode == CursorMode.Select) {
      this.canvas.getActiveObjects().forEach(async (obj) => {
        await this._drawer.changeProperty(
          obj,
          ChangeObjectProperty.StrokeWeight,
          String(weight)
        );
      });
      this.canvas.renderAll();
    }
  }

  public setDrawingTool(tool: DrawingMode) {
    this._drawer = this.drawers[tool];
  }

  //is this optimal? since everytime I need to loop every single object one user has created
  //and whenever the user select other tools I need to make the object none selectable
  public makeObjectsSeletable() {
    this.canvas.getObjects().forEach((element) => {
      element.selectable = true;
      element.hasBorders = true;
      element.hasControls = true;
      element.hoverCursor = 'move';
    });
    this.cursorMode = CursorMode.Select;
    this.canvas.renderAll();
  }

  //is this optimal? since everytime I need to loop every single object one user has created
  //and whenever the user select other tools I need to make the object none selectable
  public makeObjectsNoneSeletable() {
    this.canvas.getObjects().forEach((element) => {
      element.selectable = false;
      element.hasBorders = false;
      element.hasControls = false;
      element.hoverCursor = 'default';
    });
    this.cursorMode = CursorMode.Draw;
    this.canvas.renderAll();
  }

  private initializeCanvasEvents() {
    this.canvas.on('mouse:down', (o) => {
      const e = <MouseEvent>o.e;
      const pointer = this.canvas.getPointer(o.e);
      if (this.cursorMode === CursorMode.Draw && this._drawer) {
        this.mouseDown(pointer.x, pointer.y);
      }
    });

    this.canvas.on('mouse:move', (o) => {
      const e = <MouseEvent>o.e;
      if (this.isDown && this.cursorMode === CursorMode.Draw && this._drawer) {
        const pointer = this.canvas.getPointer(o.e);
        this.mouseMove(pointer.x, pointer.y);
      }
    });

    this.canvas.on('mouse:up', (o) => {
      this.isDown = false;
      //Only select the created object
      if (this.cursorMode === CursorMode.Draw && this._drawer) {
        this.mouseUp();
      }
    });
  }

  private async mouseDown(x: number, y: number): Promise<any> {
    this.isDown = true; //The mouse is being clicked

    //Create an object at the point (x,y)
    this.object = await this.make(x, y);

    //Add the object to the canvas
    this.canvas.add(this.object);

    //Renders all objects to the canvas
    this.canvas.renderAll();
  }

  private async mouseMove(x: number, y: number): Promise<any> {
    this.object = await this.resize(x, y);
    //Renders all objects to the canvas
    this.canvas.renderAll();
  }

  private async mouseUp(): Promise<any> {
    // Delete the object that is created on clear selection (or without drag movement)
    switch (this.object.type) {
      case ObjectType.Line: {
        if (this.object.width === 0 && this.object.height === 0) {
          this.canvas.remove(this.object);
        }
        break;
      }
      case ObjectType.Rectangle: {
        if (this.object.width === 0 || this.object.height === 0) {
          this.canvas.remove(this.object);
        }
        break;
      }
      case ObjectType.Circle: {
        if (this.object.width === 0) {
          this.canvas.remove(this.object);
        }
        break;
      }
    }

    //Making element default as none selective
    this.canvas.setActiveObject(this.object);
    this.canvas.discardActiveObject().renderAll();
  }

  //Method which allows any drawer to Promise their make() function
  private async make(x: number, y: number): Promise<fabric.Object> {
    return await this._drawer.make(x, y, this.drawerOptions);
  }

  //Method which allows any drawer to Promise their resize() function
  private async resize(x: number, y: number): Promise<fabric.Object> {
    return await this._drawer.resize(this.object, x, y);
  }

  //Method which allows any drawer to Promise their resize() function
  private async changeProperty(
    option: ChangeObjectProperty,
    value: string
  ): Promise<fabric.Object> {
    return await this._drawer.changeProperty(this.object, option, value);
  }
}
