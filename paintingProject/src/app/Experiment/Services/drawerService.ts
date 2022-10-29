import { fabric } from 'fabric';
import { CircleDrawer } from './circleDrawerService';
import { LineDrawer } from './lineDrawerService';
import { RectDrawer } from './rectDrawerService';
import { CursorMode, DrawingMode, IObjectDrawer } from './types';

export class DrawingEditor {
  canvas: fabric.Canvas;
  private cursorMode: CursorMode = CursorMode.Draw;
  public _drawer: IObjectDrawer; //Current drawer
  readonly drawerOptions: fabric.IObjectOptions; //Current drawer options
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
      strokeUniform: true,
    };

    this.isDown = false; //To start, user is NOT dragging the mouse
    this.initializeCanvasEvents();
  }

  private initializeCanvasEvents() {
    this.canvas.on('mouse:down', (o) => {
      const e = <MouseEvent>o.e;
      const pointer = this.canvas.getPointer(o.e);
      console.log('Mouse down: Get current selection:');
      console.log(this.canvas.getActiveObjects());
      console.log('Current cursor mode:', this.cursorMode);
      if (!(this.isMultipleSelected() || this.isSingleSelected())) {
        this.cursorMode = CursorMode.Draw;
      } else {
        this.cursorMode = CursorMode.Select;
      }

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
      this.cursorMode = CursorMode.Draw;
    });
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
    });
    this.canvas.renderAll();
    console.log(this.canvas.getObjects());
  }

  //is this optimal? since everytime I need to loop every single object one user has created
  //and whenever the user select other tools I need to make the object none selectable
  public makeObjectsNoneSeletable() {
    console.log('make objects Noneselectable');
    this.canvas.getObjects().forEach((element) => {
      element.selectable = false;
    });
    this.canvas.renderAll();
    console.log(this.canvas.getObjects());
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
    this.cursorMode = CursorMode.Select;
    this.canvas.setActiveObject(this.object);
    switch (this.object.type) {
      case 'line': {
        console.log(this.object);
        if (this.object.width === 0 && this.object.height === 0) {
          this.canvas.remove(this.object);
        }
        break;
      }
      case 'rect': {
        console.log(this.object);
        if (this.object.width === 0 || this.object.height === 0) {
          this.canvas.remove(this.object);
        }
        break;
      }
      case 'circle': {
        console.log(this.object);
        if (this.object.width === 0) {
          this.canvas.remove(this.object);
        }
        break;
      }
    }

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
}
