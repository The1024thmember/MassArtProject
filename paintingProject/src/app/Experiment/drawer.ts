import { fabric } from 'fabric';

export const enum DrawingMode {
  Line,
  Oval,
  Polyline,
  Path,
  Rectangle,
  Text,
  Triangle,
}

const enum CursorMode {
  Draw,
  Select,
}

export interface IObjectDrawer {
  drawingMode: DrawingMode;
  //Makes the current object
  readonly make: (
    x: number, //Horizontal starting point
    y: number, //Vertical starting point
    options: fabric.IObjectOptions,
    x2?: number, //Horizontal ending point
    y2?: number //Vertical ending point
  ) => Promise<fabric.Object>;
  //Resizes the object (used during the mouseOver event below)

  readonly resize: (
    object: any,
    x: number,
    y: number
  ) => Promise<fabric.Object>;
}

export class LineDrawer implements IObjectDrawer {
  drawingMode: DrawingMode = DrawingMode.Line;
  make(
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Object> {
    //Return a Promise that will draw a line
    return new Promise<fabric.Object>((resolve) => {
      //Inside the Promise, draw the actual line from (x,y) to (x2,y2)
      resolve(new fabric.Line([x, y, x2 ? x2 : x, y2 ? y2 : y], options));
    });
  }

  resize(object: fabric.Line, x: number, y: number): Promise<fabric.Object> {
    //Change the secondary point (x2, y2) of the object
    //This resizes the object between starting point (x,y)
    //and secondary point (x2,y2), where x2 and y2 have new values.
    object
      .set({
        x2: x,
        y2: y,
      })
      .setCoords();

    //Wrap the resized object in a Promise
    return new Promise<fabric.Object>((resolve) => {
      resolve(object);
    });
  }
}

export class DrawingEditor {
  canvas: fabric.Canvas;
  private cursorMode: CursorMode;
  private _drawer: IObjectDrawer; //Current drawer
  readonly drawerOptions: fabric.IObjectOptions; //Current drawer options
  private readonly drawers: IObjectDrawer[]; //All possible drawers
  private object: fabric.Object; //The object currently being drawn
  private isDown: boolean; //Is user dragging the mouse?

  constructor(
    private readonly selector: string,
    canvasHeight: number,
    canvasWidth: number
  ) {
    //Create the Fabric canvas
    this.canvas = new fabric.Canvas(`${selector}`, { selection: false });

    //Create a collection of all possible "drawer" classes
    this.drawers = [new LineDrawer()];

    //Set the current "drawer" class
    this._drawer = this.drawers[DrawingMode.Line];

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
      if (this.cursorMode === CursorMode.Draw) {
        this.mouseDown(pointer.x, pointer.y);
      }
    });

    this.canvas.on('mouse:move', (o) => {
      const e = <MouseEvent>o.e;

      const pointer = this.canvas.getPointer(o.e);
      if (this.cursorMode === CursorMode.Draw) {
        this.mouseMove(pointer.x, pointer.y);
      }
    });

    this.canvas.on('mouse:up', (o) => {
      this.isDown = false;
    });

    this.canvas.on('object:selected', (o) => {
      this.cursorMode = CursorMode.Select;
      //sets currently selected object
      if (o.target) {
        this.object = o.target;
      } else {
        console.log('There is no object been selected.');
      }
    });

    this.canvas.on('selection:cleared', (o) => {
      this.cursorMode = CursorMode.Draw;
      console.log('There is no object under selection');
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
    if (this.isDown) {
      this.object = await this.resize(x, y);
      //Renders all objects to the canvas
      this.canvas.renderAll();
    }
  }

  //Method which allows any drawer to Promise their make() function
  private async make(x: number, y: number): Promise<fabric.Object> {
    return await this._drawer.make(x, y, this.drawerOptions);
  }

  //Method which allows any drawer to Promise their resize() function
  private async resize(x: number, y: number): Promise<fabric.Object> {
    return await this._drawer.resize(this.object, x, y);
  }
}
