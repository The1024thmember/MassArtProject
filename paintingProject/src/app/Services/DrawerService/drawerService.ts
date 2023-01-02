import { fabric } from 'fabric';
import { ILineOptions } from 'fabric/fabric-impl';
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
  KeyDownEvent,
  ObjectType,
} from './types';

/*
  The function for this service is to: excute write (include modification) operation on object
  Create new objects or modify existing objects
*/
export class DrawingService {
  canvas: fabric.Canvas;
  emittedUndoEventObject$: Rx.Subject<EventObject[]>;
  emittedRedoEventObject$: Rx.Subject<EventObject[]>;

  _redoUndoService: RedoUndoService;
  _canvasToEventObjectCorrelationService: CanvasToEventObjectCorrelationService;

  public _drawer: IObjectDrawer; //Current drawer
  private cursorMode: CursorMode = CursorMode.Draw; //the cursorMode is select by user interaction, we can add by default is draw line
  private drawerOptions: fabric.IObjectOptions; //Current drawer options
  private readonly drawers: IObjectDrawer[]; //All possible drawers
  private object: fabric.Object; //The object currently being drawn
  private isDown: boolean; //Is user dragging the mouse?
  private subscription = new Rx.Subscription();
  private oldColor: string = 'black';
  private oldWeight: number = 1;

  private copyObjects: fabric.Object[] = [];
  private pasteObjects$ = new Rx.Subject<boolean>();

  constructor(
    canvas: fabric.Canvas,
    _redoUndoService: RedoUndoService,
    emittedUndoEventObject$: Rx.Subject<EventObject[]>,
    emittedRedoEventObject$: Rx.Subject<EventObject[]>
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
      fill: '',
      hoverCursor: 'default',
    };

    this.isDown = false; //To start, user is NOT dragging the mouse
    this.initializeCanvasEvents();
    this.setDrawingTool(DrawingMode.Line);
  }

  // ---- need to add validations for the input value ---//
  //Change the color for the current selection
  public async setDrawingColor(color: string) {
    if (this.oldColor != color) {
      this.drawerOptions.stroke = color;
      if (this.cursorMode == CursorMode.Select) {
        let changePropertyEventsBatch: (EventObject | undefined)[] = [];
        // returns a promise refer: https://zellwk.com/blog/async-await-in-loops/
        const promises = this.canvas.getActiveObjects().map(async (obj) => {
          if (obj.stroke != color) {
            console.log('change color');
            const changePropertyEvent = await this.changeProperty(
              obj,
              ChangeObjectProperty.StrokeColor,
              color
            );
            return changePropertyEvent;
          }
          return;
        });

        // Emit the events
        changePropertyEventsBatch = await Promise.all(promises);
        const changePropertyEventsBatchValidated =
          changePropertyEventsBatch.filter(
            (changePropertyEvent) => changePropertyEvent
          ) as EventObject[];
        if (changePropertyEventsBatchValidated.length) {
          this._redoUndoService.emitEvent(changePropertyEventsBatchValidated);
        }
      }
      this.canvas.renderAll();
      this.oldColor = color;
    }
  }

  // ---- need to add validations for the input value ---//
  // Change the width for the current selection
  public async setDrawingWeight(weight: number) {
    if (this.oldWeight != weight) {
      this.drawerOptions.strokeWidth = Math.floor(weight);
      if (this.cursorMode == CursorMode.Select) {
        let changePropertyEventsBatch: (EventObject | undefined)[] = [];
        // Need to refactor the code to make before object and after object avaliable,
        // now due to async function, before object is already changed, since it run changeProperty first before getting the before value
        const promises = this.canvas.getActiveObjects().map(async (obj) => {
          if (obj.strokeWidth && obj.strokeWidth != weight) {
            const changePropertyEvent = await this.changeProperty(
              obj,
              ChangeObjectProperty.StrokeWeight,
              weight.toString()
            );
            return changePropertyEvent;
          }
          return;
        });

        // Emit the events
        changePropertyEventsBatch = await Promise.all(promises);
        const changePropertyEventsBatchValidated =
          changePropertyEventsBatch.filter(
            (changePropertyEvent) => changePropertyEvent
          ) as EventObject[];
        if (changePropertyEventsBatchValidated.length) {
          this._redoUndoService.emitEvent(changePropertyEventsBatchValidated);
        }
      }
      this.canvas.renderAll();
      this.oldWeight = weight;
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

  // Handle deletion via click delete object button
  public handleDeletion() {
    this.handleDelete();
  }

  // Handle copy
  public handleCopy() {
    // check if the current mode is selection mode & there are active objects
    this.copyObjects = this.canvas.getActiveObjects();
    console.log('copying');
  }

  // Handle paste
  public handlePaste() {
    // after the paste, the draw mode should still be selection mode
    // reuse the logic for creation,
    this.pasteObjects$.next(true);
    console.log('pasteing');
  }

  // Handle keydown event, such as object deletion
  public handleKeyDown(e: any) {
    switch (e.key) {
      case KeyDownEvent.Delete: {
        this.handleDelete();
        break;
      }
      case KeyDownEvent.Copy: {
        this.handleCopy();
        break;
      }
      case KeyDownEvent.Paste: {
        this.handlePaste();
        break;
      }
    }
    this.canvas.renderAll();
  }

  public getCursorMode() {
    return this.cursorMode;
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
      this.emittedUndoEventObject$.subscribe((undoEvents) => {
        // Based on command calling changeProperty to change the property of the object
        // Or delete/create accordingly

        // Need to de-select everything, since that will make property change on moving, and scale with right position
        this.canvas.discardActiveObject();

        undoEvents.forEach((undoEvent) => {
          switch (undoEvent.command) {
            case CommandType.Create: {
              // No matter what the object is, just simply delete it based on canvasObjectId
              this.undoCreationEvent(
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
              this.undoDeletionEvent(undoEvent, () =>
                this._canvasToEventObjectCorrelationService.getCanvasObjectLocation(
                  undoEvent
                )
              );
              break;
            }
            case CommandType.ChangeProperty: {
              this.undoChangePropertyEvent(undoEvent, () =>
                this._canvasToEventObjectCorrelationService.getCanvasObjectLocation(
                  undoEvent
                )
              );
              break;
            }
          }
        });
        this.canvas.renderAll();
      })
    );

    this.subscription.add(
      this.emittedRedoEventObject$.subscribe((redoEvents) => {
        // calling changeProperty to change the property of the object
        // Or delete/create accordingly
        redoEvents.forEach((redoEvent) => {
          switch (redoEvent.command) {
            case CommandType.Create: {
              // No matter what the object is, just simply delete it based on canvasObjectId
              this.redoCreationEvent(redoEvent, () =>
                this._canvasToEventObjectCorrelationService.getCanvasObjectLocation(
                  redoEvent
                )
              );
              break;
            }
            case CommandType.Delete: {
              this.redoDeletionEvent(
                redoEvent,
                () =>
                  this._canvasToEventObjectCorrelationService.getCanvasObjectLocation(
                    redoEvent
                  ),
                this._canvasToEventObjectCorrelationService.ghostObjectProperty
              );
              break;
            }
            case CommandType.ChangeProperty: {
              this.redoChangePropertyEvent(redoEvent, () =>
                this._canvasToEventObjectCorrelationService.getCanvasObjectLocation(
                  redoEvent
                )
              );
              break;
            }
          }
        });
        this.canvas.renderAll();
      })
    );

    // handle copy paste action
    this.subscription.add(
      this.pasteObjects$.subscribe(async (_) => {
        let creationsFromCopyEvent: (EventObject | undefined)[] = [];

        const promises = this.copyObjects.map(async (copiedObject) => {
          const newCopiedObject = await this.clone(copiedObject);
          //Increase the number for object created
          this._canvasToEventObjectCorrelationService.addNewObject();

          //Sending create new object event to redoUndoService
          return this._redoUndoService.buildCreationEventObject(
            this._canvasToEventObjectCorrelationService.getEventObjectCorrelationId(),
            newCopiedObject,
            { ...newCopiedObject }
          );
        });

        // Emit the event
        creationsFromCopyEvent = await Promise.all(promises);
        const creationsFromCopyEventBatchValidated =
          creationsFromCopyEvent.filter(
            (creationFromCopyEvent) => creationFromCopyEvent
          ) as EventObject[];
        if (creationsFromCopyEventBatchValidated.length) {
          this._redoUndoService.emitEvent(creationsFromCopyEventBatchValidated);
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
    switch (this.object.type) {
      case ObjectType.Line: {
        if (this.object.width === 0 && this.object.height === 0) {
          this.canvas.remove(this.object);
          return;
        }
        break;
      }
      case ObjectType.Rectangle: {
        if (this.object.width === 0 || this.object.height === 0) {
          this.canvas.remove(this.object);
          return;
        }
        break;
      }
      case ObjectType.Circle: {
        if (this.object.width === 0) {
          this.canvas.remove(this.object);
          return;
        }
        break;
      }
      case ObjectType.Path: {
        if (!this.object) {
          //need to check path length
          this.canvas.remove(this.object);
          return;
        }
        break;
      }
    }

    //Making element default as none selective
    this.canvas.setActiveObject(this.object);
    this.canvas.discardActiveObject().renderAll();

    //Increase the number for object created
    this._canvasToEventObjectCorrelationService.addNewObject();

    //Sending create new object event to redoUndoService
    const creationEvent = this._redoUndoService.buildCreationEventObject(
      this._canvasToEventObjectCorrelationService.getEventObjectCorrelationId(),
      this.object,
      this.drawerOptions
    );

    // Emit the event
    this._redoUndoService.emitEvent([creationEvent]);
  }

  //Method which allows any drawer to Promise their make() function
  private async make(x: number, y: number): Promise<fabric.Object> {
    // alernative drawer is used in copy and paste event, where I don't want to change the
    // private field _drawer but to reuse this function
    return await this._drawer.make(x, y, this.drawerOptions);
  }

  //Method which allows any drawer to Promise their resize() function
  private async resize(x: number, y: number): Promise<fabric.Object> {
    return await this._drawer.resize(this.object, x, y, {}, this.canvas);
  }

  //Method which allows any drawer to Promise their resize() function
  private async changeProperty(
    canvasObject: fabric.Object,
    option: ChangeObjectProperty,
    value: string
  ): Promise<EventObject> {
    var index = this.canvas.getObjects().indexOf(canvasObject);
    // Json.stringify will discard the functions, but in this case we need the functions
    const beforeChangedObj = JSON.parse(JSON.stringify(canvasObject));
    Object.assign(beforeChangedObj, {
      group: { ...canvasObject.group },
      canvas: canvasObject.canvas,
      ...canvasObject.getObjectScaling(),
    });
    const afterChangedObj = await this._drawer.changeProperty(
      canvasObject,
      option,
      value
    );
    // Create a change property event object
    const changePropertyEvent =
      this._redoUndoService.buildPropertyChangeEventObject(
        index + 1,
        beforeChangedObj,
        afterChangedObj,
        this.drawerOptions
      );
    return changePropertyEvent;
  }

  // Method which allows to clone an existing object
  private async clone(tobeCloned: fabric.Object): Promise<fabric.Object> {
    let _alternativeDrawer;
    let tobeCloneProperties = {};
    let clonedObject = new fabric.Object();

    Object.assign(tobeCloneProperties, {
      ...this.drawerOptions,
      stroke: tobeCloned.stroke,
      strokeWidth: tobeCloned.strokeWidth,
    });

    var topFromCanvas = tobeCloned.top ? tobeCloned.top : 0;
    var leftFromCanvas = tobeCloned.left ? tobeCloned.left : 0;

    if (tobeCloned.group) {
      const leftFromGroup = tobeCloned.group.left ? tobeCloned.group.left : 0;
      const widthOfGroup = tobeCloned.group.width ? tobeCloned.group.width : 0;
      const topFromGroup = tobeCloned.group.top ? tobeCloned.group.top : 0;
      const heightOfGroup = tobeCloned.group.height
        ? tobeCloned.group.height
        : 0;

      topFromCanvas = topFromGroup + topFromCanvas + heightOfGroup / 2;
      leftFromCanvas = leftFromGroup + leftFromCanvas + widthOfGroup / 2;
    }

    switch (tobeCloned.type) {
      case ObjectType.Line: {
        _alternativeDrawer = this.drawers[0];
        const typeSpecificObject = tobeCloned as ILineOptions;
        Object.assign(tobeCloneProperties, {
          left: leftFromCanvas + 10,
          top: topFromCanvas + 10,
        });
        clonedObject = await _alternativeDrawer.make(
          leftFromCanvas,
          topFromCanvas,
          tobeCloneProperties,
          typeSpecificObject.x2,
          typeSpecificObject.y2
        );
        this.canvas.add(clonedObject);
        break;
      }
      case ObjectType.Rectangle: {
        _alternativeDrawer = this.drawers[1];
        const typeSpecificObject = tobeCloned as fabric.Rect;
        Object.assign(tobeCloneProperties, {
          width: typeSpecificObject.width,
          height: typeSpecificObject.height,
        });
        clonedObject = await _alternativeDrawer.make(
          leftFromCanvas + 10,
          topFromCanvas + 10,
          tobeCloneProperties
        );
        this.canvas.add(clonedObject);
        break;
      }
      case ObjectType.Circle: {
        _alternativeDrawer = this.drawers[2];
        const typeSpecificObject = tobeCloned as fabric.Circle;
        Object.assign(tobeCloneProperties, {
          radius: typeSpecificObject.radius,
        });
        clonedObject = await _alternativeDrawer.make(
          leftFromCanvas + 10,
          topFromCanvas + 10,
          tobeCloneProperties,
          typeSpecificObject.radius
        );
        this.canvas.add(clonedObject);
        break;
      }
      case ObjectType.Path: {
        _alternativeDrawer = this.drawers[3];
        const typeSpecificObject = tobeCloned as fabric.Path;
        Object.assign(tobeCloneProperties, {
          path: typeSpecificObject.path,
          left: leftFromCanvas + 10,
          top: topFromCanvas + 10,
        });
        clonedObject = await _alternativeDrawer.make(
          leftFromCanvas + 10,
          topFromCanvas + 10,
          tobeCloneProperties,
          undefined,
          undefined,
          typeSpecificObject.path
        );
        this.canvas.add(clonedObject);
        break;
      }
    }
    console.log('clonedObject:', clonedObject);
    return clonedObject;
  }

  // The deletion handler
  private handleDelete() {
    if (this.cursorMode === CursorMode.Select) {
      const deletionEventsBatch: EventObject[] = [];
      this.canvas.getActiveObjects().forEach((activeObject) => {
        var index = this.canvas.getObjects().indexOf(activeObject);
        // Create a delete event object
        const deletionEvent = this._redoUndoService.buildDeletionEventObject(
          index + 1,
          activeObject,
          {
            ...this.drawerOptions,
            stroke: activeObject.stroke,
            strokeWidth: activeObject.strokeWidth,
          }
        );

        deletionEventsBatch.push(deletionEvent);

        // Do the actual deletion
        switch (activeObject.type) {
          case 'line': {
            this.canvas._objects[index] = new fabric.Line(
              [0, 0, 0, 0],
              this._canvasToEventObjectCorrelationService.ghostObjectProperty
            );
            break;
          }
          case 'rect': {
            this.canvas._objects[index] = new fabric.Rect({
              left: 0,
              top: 0,
              ...this._canvasToEventObjectCorrelationService
                .ghostObjectProperty,
            });
            break;
          }
          case 'circle': {
            this.canvas._objects[index] = new fabric.Circle({
              left: 0,
              top: 0,
              radius: 0,
              ...this._canvasToEventObjectCorrelationService
                .ghostObjectProperty,
            });
            break;
          }
          case 'path': {
            this.canvas._objects[index] = new fabric.Path(
              [['M', 0, 0] as unknown as fabric.Point],
              this._canvasToEventObjectCorrelationService.ghostObjectProperty
            );
            break;
          }
        }
      });

      // Need to de-select everything, since after delection we don't want to see the selection box
      this.canvas.discardActiveObject().renderAll();

      // Emit the events
      if (deletionEventsBatch.length) {
        this._redoUndoService.emitEvent(deletionEventsBatch);
      }
    }
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
  private undoCreationEvent(
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
        break;
      }
      case 'rect': {
        this.canvas._objects[canvasObjectLocation] = new fabric.Rect({
          left: 0,
          top: 0,
          ...additionalProperty,
        });
        break;
      }
      case 'circle': {
        this.canvas._objects[canvasObjectLocation] = new fabric.Circle({
          left: 0,
          top: 0,
          radius: 0,
          ...additionalProperty,
        });
        break;
      }
      case 'path': {
        this.canvas._objects[canvasObjectLocation] = new fabric.Path(
          [['M', 0, 0] as unknown as fabric.Point],
          additionalProperty
        );
        break;
      }
    }
  }

  // undo a deletion event
  private undoDeletionEvent(
    undoEvent: EventObject,
    canvasObjectLocator: Function
  ) {
    const canvasObjectLocation = canvasObjectLocator();
    switch (undoEvent.canvasObjectType) {
      case 'line': {
        this.canvas._objects[canvasObjectLocation] = this.canvas._objects[
          canvasObjectLocation
        ]
          .set({ ...undoEvent.snapShotBefore })
          .setCoords();

        break;
      }
      case 'rect': {
        this.canvas._objects[canvasObjectLocation] = this.canvas._objects[
          canvasObjectLocation
        ]
          .set({ ...undoEvent.snapShotBefore })
          .setCoords();

        break;
      }
      case 'circle': {
        this.canvas._objects[canvasObjectLocation] = this.canvas._objects[
          canvasObjectLocation
        ]
          .set({ ...undoEvent.snapShotBefore })
          .setCoords();

        break;
      }
      case 'path': {
        var pathPoints: unknown = [];
        Object.entries(undoEvent.snapShotBefore).forEach((entries) => {
          if (entries[0] === 'path') {
            pathPoints = entries[1];
          }
        });
        this.canvas._objects[canvasObjectLocation] = new fabric.Path(
          pathPoints as unknown as fabric.Point[],
          undoEvent.snapShotBefore
        );

        break;
      }
    }
    this.canvas._objects[canvasObjectLocation].canvas = undoEvent._canvas;
    if (this.cursorMode == CursorMode.Select) {
      this.canvas._objects[canvasObjectLocation].selectable = true;
      this.canvas._objects[canvasObjectLocation].hoverCursor = 'move';
    }
  }

  // undo a change property Event
  private undoChangePropertyEvent(
    undoEvent: EventObject,
    canvasObjectLocator: Function
  ) {
    const canvasObjectLocation = canvasObjectLocator();
    switch (undoEvent.canvasObjectType) {
      case 'line': {
        this.canvas._objects[canvasObjectLocation] = this.canvas._objects[
          canvasObjectLocation
        ]
          .set({ ...undoEvent.snapShotBefore })
          .setCoords();
        break;
      }
      case 'rect': {
        this.canvas._objects[canvasObjectLocation] = this.canvas._objects[
          canvasObjectLocation
        ]
          .set({ ...undoEvent.snapShotBefore })
          .setCoords();
        break;
      }
      case 'circle': {
        this.canvas._objects[canvasObjectLocation] = this.canvas._objects[
          canvasObjectLocation
        ]
          .set({ ...undoEvent.snapShotBefore })
          .setCoords();
        break;
      }
      case 'path': {
        this.canvas._objects[canvasObjectLocation] = this.canvas._objects[
          canvasObjectLocation
        ]
          .set({ ...undoEvent.snapShotBefore })
          .setCoords();
        break;
      }
    }
    this.canvas._objects[canvasObjectLocation].canvas = undoEvent._canvas;
    if (this.cursorMode == CursorMode.Select) {
      this.canvas._objects[canvasObjectLocation].selectable = true;
      this.canvas._objects[canvasObjectLocation].hoverCursor = 'move';
    }
  }

  // redo a create event
  private redoCreationEvent(
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
  }

  // redo a deletion event
  private redoDeletionEvent(
    redoEvent: EventObject,
    canvasObjectLocator: Function,
    additionalProperty: any
  ) {
    const canvasObjectLocation = canvasObjectLocator();
    // still not the best way for handling redo & undo, since the logic here is
    // still re-assgin to new object, which doesn't give flexibility for real
    // deletion.
    switch (redoEvent.canvasObjectType) {
      case 'line': {
        this.canvas._objects[canvasObjectLocation] = new fabric.Line(
          [0, 0, 0, 0],
          additionalProperty
        );
        break;
      }
      case 'rect': {
        this.canvas._objects[canvasObjectLocation] = new fabric.Rect({
          left: 0,
          top: 0,
          ...additionalProperty,
        });
        break;
      }
      case 'circle': {
        this.canvas._objects[canvasObjectLocation] = new fabric.Circle({
          left: 0,
          top: 0,
          radius: 0,
          ...additionalProperty,
        });
        break;
      }
      case 'path': {
        this.canvas._objects[canvasObjectLocation] = new fabric.Path(
          [['M', 0, 0] as unknown as fabric.Point],
          additionalProperty
        );
        break;
      }
    }
  }

  // redo a change property Event
  private redoChangePropertyEvent(
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
        this.canvas._objects[canvasObjectLocation] = this.canvas._objects[
          canvasObjectLocation
        ]
          .set({ ...redoEvent.snapShotAfter })
          .setCoords();
        break;
      }
    }
    this.canvas._objects[canvasObjectLocation].canvas = redoEvent._canvas;
    if (this.cursorMode == CursorMode.Select) {
      this.canvas._objects[canvasObjectLocation].selectable = true;
      this.canvas._objects[canvasObjectLocation].hoverCursor = 'move';
    }
  }
}
