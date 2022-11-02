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
      selectable: true,
      strokeUniform: false,
      borderColor: BorderColor.xxxlight,
      cornerColor: BorderColor.xxlight,
      transparentCorners: false,
      cornerSize: CornerSize.desktop,
      fill: undefined,
      hoverCursor: 'default',
    };

    this.isDown = false; //To start, user is NOT dragging the mouse
    this.initializeCanvasEvents();
  }

  // ---- need to add validations for the input value ---//
  //Change the color for the current selection
  public setDrawingColor(color: string) {
    this.drawerOptions = { ...this.drawerOptions, stroke: color };
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
  //Change the color for the current selection
  public setDrawingWeight(weight: number) {
    this.drawerOptions = { ...this.drawerOptions, strokeWidth: weight };
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
    console.log('Current tools is:', this._drawer);
  }

  //is this optimal? since everytime I need to loop every single object one user has created
  //and whenever the user select other tools I need to make the object none selectable
  public makeObjectsSeletable() {
    console.log('make objects selectable');
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
    console.log('make objects Noneselectable');
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

    /*  Will be trigger via:
        1) create new object, the new object will be selected
        2) when currently there is no selection, selected something
    */

    this.canvas.on('selection:created', (o) => {
      // after creating, it is selected by default
      console.log(`${o.target} is being selected`);
      console.log(o);
    });

    /*  Will be trigger via:
        1) change selection from A object to B object
    */
    this.canvas.on('selection:updated', (o) => {
      // change selection
      console.log(`${o.target} is being chosen`);
      console.log(o);
    });

    /*  Will be trigger via:
        1) When previous has some selected object, then remove them by click on
           elsewhere in the canvas
    */
    this.canvas.on('selection:cleared', (o) => {
      // mouse click on empty canvas, so no object is selected
      console.log('No object under selection');
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
    this.canvas.setActiveObject(this.object);
    switch (this.object.type) {
      case ObjectType.Line: {
        console.log(this.object);
        if (this.object.width === 0 && this.object.height === 0) {
          this.canvas.remove(this.object);
        }
        break;
      }
      case ObjectType.Rectangle: {
        console.log(this.object);
        if (this.object.width === 0 || this.object.height === 0) {
          this.canvas.remove(this.object);
        }
        break;
      }
      case ObjectType.Circle: {
        console.log(this.object);
        if (this.object.width === 0) {
          this.canvas.remove(this.object);
        }
        break;
      }
    }

    //Making element default as none selective
    this.canvas.discardActiveObject().renderAll();
    console.log('Mouse up: Get current selection:');
    console.log(this.canvas.getActiveObjects());
    console.log('Current cursor mode:', this.cursorMode);
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

  private isMultipleSelected() {
    if (this.canvas.getActiveObjects().length > 1) {
      return true;
    }
    return false;
  }

  private isSingleSelected() {
    if (this.canvas.getActiveObjects().length == 1) {
      return true;
    }
    return false;
  }

  // Remove active (selected) objects
  private removeActiveObject() {
    this.canvas.getActiveObjects().forEach((obj) => {
      this.canvas.remove(obj);
    });
    this.canvas.discardActiveObject().renderAll();
  }
}
