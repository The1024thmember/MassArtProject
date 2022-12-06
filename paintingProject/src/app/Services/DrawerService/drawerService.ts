import { fabric } from 'fabric';
import {
  ICircleOptions,
  ILineOptions,
  IPathOptions,
  IRectOptions,
} from 'fabric/fabric-impl';
import * as Rx from 'rxjs';
import { CanvasToEventObjectCorrelationService } from '../CanvasToEventObjectCorrelationService/canvasToEventObjectCorrelationService';
import { RedoUndoService } from '../RedoUndoService/redoUndoService';
import { CommandType, EventObject } from '../RedoUndoService/types';
import { CircleDrawer } from './circleDrawerService';
import { FreeDrawer } from './freeDrawerService';
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
  The function for this service is to: excute write (include modification) operation on object
  Create new objects or modify existing objects
*/
export class DrawingService {
  canvas: fabric.Canvas;
  emittedUndoEventObject$: Rx.Subject<EventObject>;
  emittedRedoEventObject$: Rx.Subject<EventObject>;

  _redoUndoService: RedoUndoService;
  _canvasToEventObjectCorrelationService: CanvasToEventObjectCorrelationService;

  public _drawer: IObjectDrawer; //Current drawer
  private cursorMode: CursorMode = CursorMode.Draw; //the cursorMode is select by user interaction, we can add by default is draw line
  private drawerOptions: fabric.IObjectOptions; //Current drawer options
  private readonly drawers: IObjectDrawer[]; //All possible drawers
  private object: fabric.Object; //The object currently being drawn
  private isDown: boolean; //Is user dragging the mouse?
  private subscription = new Rx.Subscription();

  constructor(
    canvas: fabric.Canvas,
    _redoUndoService: RedoUndoService,
    emittedUndoEventObject$: Rx.Subject<EventObject>,
    emittedRedoEventObject$: Rx.Subject<EventObject>
  ) {
    //Create the Fabric canvas
    this.canvas = canvas;
    this._redoUndoService = _redoUndoService;
    this._canvasToEventObjectCorrelationService =
      new CanvasToEventObjectCorrelationService();

    this.emittedUndoEventObject$ = emittedUndoEventObject$;
    this.emittedRedoEventObject$ = emittedRedoEventObject$;

    //Create a collection of all possible "drawer" classes
    this.drawers = [
      new LineDrawer(),
      new RectDrawer(),
      new CircleDrawer(),
      new FreeDrawer(),
    ];

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
    this.drawerOptions.strokeWidth = Math.floor(weight);
    if (this.cursorMode == CursorMode.Select) {
      this.canvas.getActiveObjects().forEach(async (obj) => {
        console.warn('activeObjct:', obj);
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
    this.cursorMode = CursorMode.Draw;
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
    this.canvas.discardActiveObject();
    this.canvas.getObjects().forEach((element) => {
      element.selectable = false;
      element.hasBorders = false;
      element.hasControls = false;
      element.hoverCursor = 'default';
    });
    this.canvas.renderAll();
  }

  private initializeCanvasEvents() {
    // handle canvas draw action
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

    // handle redo/undo action
    this.subscription.add(
      this.emittedUndoEventObject$.subscribe((undoEvent) => {
        console.log('undo event:', undoEvent);
        // Based on command calling changeProperty to change the property of the object
        // Or delete/create accordingly
        switch (undoEvent.command) {
          case CommandType.Create: {
            // No matter what the object is, just simply delete it based on canvasObjectId
            this.undoCreateEvent(
              undoEvent,
              () =>
                this._canvasToEventObjectCorrelationService.getCanvasObjectLocation(
                  undoEvent
                ),
              this._canvasToEventObjectCorrelationService.ghostObjectProperty
            );
            break;
          }
          case CommandType.Delete: {
            break;
          }
          case CommandType.ChangeProperty: {
            break;
          }
        }
        this.canvas.renderAll();
      })
    );

    this.subscription.add(
      this.emittedRedoEventObject$.subscribe((redoEvent) => {
        console.log('redo event:', redoEvent);
        // calling changeProperty to change the property of the object
        // Or delete/create accordingly
        switch (redoEvent.command) {
          case CommandType.Create: {
            // No matter what the object is, just simply delete it based on canvasObjectId
            this.redoCreateEvent(redoEvent, () =>
              this._canvasToEventObjectCorrelationService.getCanvasObjectLocation(
                redoEvent
              )
            );
            break;
          }
          case CommandType.Delete: {
            break;
          }
          case CommandType.ChangeProperty: {
            break;
          }
        }
        this.canvas.renderAll();
      })
    );
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
    const creationEvent: EventObject = new EventObject();
    switch (this.object.type) {
      case ObjectType.Line: {
        if (this.object.width === 0 && this.object.height === 0) {
          this.canvas.remove(this.object);
          return;
        }
        creationEvent.canvasObjectType = ObjectType.Line;
        const lineObject = this.object as ILineOptions;
        creationEvent.snapShotAfter = {
          left: lineObject.left,
          top: lineObject.top,
          x1: lineObject.x1,
          y1: lineObject.y1,
          x2: lineObject.x2,
          y2: lineObject.y2,
        };
        break;
      }
      case ObjectType.Rectangle: {
        if (this.object.width === 0 || this.object.height === 0) {
          this.canvas.remove(this.object);
          return;
        }
        creationEvent.canvasObjectType = ObjectType.Rectangle;
        const rectObject = this.object as IRectOptions;
        creationEvent.snapShotAfter = {
          left: rectObject.left,
          top: rectObject.top,
          width: rectObject.width,
          height: rectObject.height,
        };
        break;
      }
      case ObjectType.Circle: {
        if (this.object.width === 0) {
          this.canvas.remove(this.object);
          return;
        }
        creationEvent.canvasObjectType = ObjectType.Circle;
        const circleObject = this.object as ICircleOptions;
        creationEvent.snapShotAfter = {
          left: circleObject.left,
          top: circleObject.top,
          radius: circleObject.radius,
        };
        break;
      }
      case ObjectType.Path: {
        console.warn('selecting free draw');
        if (!this.object) {
          //need to check path length
          this.canvas.remove(this.object);
          return;
        }
        creationEvent.canvasObjectType = ObjectType.Path;
        const pathObject = this.object as IPathOptions;
        creationEvent.snapShotAfter = {
          path: pathObject.path,
        };
        break;
      }
    }
    //Making element default as none selective
    this.canvas.setActiveObject(this.object);
    this.canvas.discardActiveObject().renderAll();

    //Increase the number for object created
    this._canvasToEventObjectCorrelationService.addNewObject();

    //Sending create new object event to redoUndoService
    console.log(this.object);

    creationEvent.canvasObjectId =
      this._canvasToEventObjectCorrelationService.getEventObjectCorrelationId();

    creationEvent.snapShotBefore = {};
    //Set position, width/height data, and appending draweroptions for rect,circle and line Object
    Object.assign(creationEvent.snapShotAfter, this.drawerOptions);

    //Need to record .canvas property as well, otherwise undo redo creation then switch to selection will by buggy
    creationEvent._canvas = this.object.canvas;
    creationEvent.command = CommandType.Create;

    this._redoUndoService.emitEvent(creationEvent);
  }

  //Method which allows any drawer to Promise their make() function
  private async make(x: number, y: number): Promise<fabric.Object> {
    return await this._drawer.make(x, y, this.drawerOptions);
  }

  //Method which allows any drawer to Promise their resize() function
  private async resize(x: number, y: number): Promise<fabric.Object> {
    return await this._drawer.resize(this.object, x, y, {}, this.canvas);
  }

  //Method which allows any drawer to Promise their resize() function
  private async changeProperty(
    option: ChangeObjectProperty,
    value: string
  ): Promise<fabric.Object> {
    return await this._drawer.changeProperty(this.object, option, value);
  }

  // Remove active (selected) objects
  private removeActiveObject() {
    if (this.cursorMode == CursorMode.Select) {
      this.canvas.getActiveObjects().forEach((obj) => {
        this.canvas.remove(obj);
      });
      this.canvas.discardActiveObject().renderAll();
    }
  }

  // undo a create event
  private undoCreateEvent(
    undoEvent: EventObject,
    canvasObjectLocator: Function,
    additionalProperty: any
  ) {
    const canvasObjectLocation = canvasObjectLocator();
    // still not the best way for handling redo & undo, since the logic here is
    // still re-assgin to new object, which doesn't give flexibility for real
    // deletion.
    switch (undoEvent.canvasObjectType) {
      case 'line': {
        this.canvas._objects[canvasObjectLocation] = new fabric.Line(
          [0, 0, 0, 0],
          additionalProperty
        );
        console.log(this.canvas._objects);
        break;
      }
      case 'rect': {
        this.canvas._objects[canvasObjectLocation] = new fabric.Rect({
          left: 0,
          top: 0,
          ...additionalProperty,
        });
        console.log(this.canvas._objects);
        break;
      }
      case 'circle': {
        this.canvas._objects[canvasObjectLocation] = new fabric.Circle({
          left: 0,
          top: 0,
          radius: 0,
          ...additionalProperty,
        });
        console.log(this.canvas._objects);
        break;
      }
      case 'path': {
        this.canvas._objects[canvasObjectLocation] = new fabric.Path(
          [['M', 0, 0] as unknown as fabric.Point],
          additionalProperty
        );
        console.log(this.canvas._objects);
        break;
      }
    }
  }

  // redo a create event
  private redoCreateEvent(
    redoEvent: EventObject,
    canvasObjectLocator: Function
  ) {
    const canvasObjectLocation = canvasObjectLocator();
    switch (redoEvent.canvasObjectType) {
      case 'line': {
        this.canvas._objects[canvasObjectLocation] = this.canvas._objects[
          canvasObjectLocation
        ]
          .set({ ...redoEvent.snapShotAfter })
          .setCoords();

        break;
      }
      case 'rect': {
        this.canvas._objects[canvasObjectLocation] = this.canvas._objects[
          canvasObjectLocation
        ]
          .set({ ...redoEvent.snapShotAfter })
          .setCoords();

        break;
      }
      case 'circle': {
        this.canvas._objects[canvasObjectLocation] = this.canvas._objects[
          canvasObjectLocation
        ]
          .set({ ...redoEvent.snapShotAfter })
          .setCoords();

        break;
      }
      case 'path': {
        console.log(' redoEvent.snapShotAfter:', redoEvent.snapShotAfter);
        var pathPoints: unknown = [];
        Object.entries(redoEvent.snapShotAfter).forEach((entries) => {
          if (entries[0] === 'path') {
            pathPoints = entries[1];
          }
        });
        this.canvas._objects[canvasObjectLocation] = new fabric.Path(
          pathPoints as unknown as fabric.Point[],
          redoEvent.snapShotAfter
        );

        break;
      }
    }
    this.canvas._objects[canvasObjectLocation].canvas = redoEvent._canvas;
    if (this.cursorMode == CursorMode.Select) {
      this.canvas._objects[canvasObjectLocation].selectable = true;
      this.canvas._objects[canvasObjectLocation].hoverCursor = 'move';
    }
    console.warn(
      'after redo create:',
      this.canvas._objects[canvasObjectLocation]
    );
  }
}
