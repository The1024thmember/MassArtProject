import { fabric } from 'fabric';
import { ILineOptions } from 'fabric/fabric-impl';
import * as Rx from 'rxjs';
import { PositionType, getObjectAbsolutePosition } from 'src/app/Helpers';
import { CanvasToEventObjectCorrelationService } from '../CanvasToEventObjectCorrelationService/canvasToEventObjectCorrelationService';
import { RedoUndoService } from '../RedoUndoService/redoUndoService';
import {
  CommandType,
  EventObject,
  PropertiesSnapShot,
} from '../RedoUndoService/types';
import { CircleDrawer } from './circleDrawerService';
import { FreeDrawer } from './freeDrawerService';
import { LineDrawer } from './lineDrawerService';
import { RectDrawer } from './rectDrawerService';
import {
  BorderColor,
  ChangeObjectProperty,
  CornerSize,
  CreateFromDataType,
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

  // others draw events
  receivedEventObject$: Rx.Observable<EventObject[]>;

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
    emittedRedoEventObject$: Rx.Subject<EventObject[]>,
    receivedEventObject$: Rx.Observable<EventObject[]>
  ) {
    //Create the Fabric canvas
    this.canvas = canvas;
    this._redoUndoService = _redoUndoService;
    this._canvasToEventObjectCorrelationService =
      new CanvasToEventObjectCorrelationService();

    this.emittedUndoEventObject$ = emittedUndoEventObject$;
    this.emittedRedoEventObject$ = emittedRedoEventObject$;

    this.receivedEventObject$ = receivedEventObject$;

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
          this.emitEvent(changePropertyEventsBatchValidated);
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
          this.emitEvent(changePropertyEventsBatchValidated);
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

    // handle undo action
    this.subscription.add(
      this.emittedUndoEventObject$.subscribe(async (undoEvents) => {
        // Based on command calling changeProperty to change the property of the object
        // Or delete/create accordingly

        // Need to de-select everything, since that will make property change on moving, and scale with right position
        this.canvas.discardActiveObject();

        const promises = undoEvents.map(async (undoEvent) => {
          switch (undoEvent.command) {
            case CommandType.Create: {
              // No matter what the object is, just simply delete it based on canvasObjectId
              await this.undoCreationEvent(
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
        await Promise.all(promises);
        this.canvas.renderAll();
      })
    );

    // handle redo action
    this.subscription.add(
      this.emittedRedoEventObject$.subscribe(async (redoEvents) => {
        // calling changeProperty to change the property of the object
        // Or delete/create accordingly
        const promises = redoEvents.map(async (redoEvent) => {
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
              await this.redoDeletionEvent(
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
        await Promise.all(promises);
        this.canvas.renderAll();
      })
    );

    // handle copy paste action
    this.subscription.add(
      this.pasteObjects$.subscribe(async (_) => {
        const promises = this.copyObjects.map(async (copiedObject) => {
          //const newCopiedObject = await this.clone(copiedObject);
          const newCopiedObject = await this.createCanvasObjectFromData(
            copiedObject,
            CreateFromDataType.CLONE
          );
          //Increase the number for object created
          this._canvasToEventObjectCorrelationService.addNewObject();
          //Sending create new object event to redoUndoService
          let properties: PropertiesSnapShot = {
            left: newCopiedObject.left ?? undefined,
            top: newCopiedObject.top ?? undefined,
            stroke: newCopiedObject.stroke ?? undefined,
            strokeWidth: newCopiedObject.strokeWidth ?? undefined,
            originX: newCopiedObject.originX ?? undefined,
            originY: newCopiedObject.originY ?? undefined,
            width: newCopiedObject.width ?? undefined,
            height: newCopiedObject.height ?? undefined,
          };
          return this._redoUndoService.buildCreationEventObject(
            this._canvasToEventObjectCorrelationService.getEventObjectCorrelationId(),
            newCopiedObject,
            properties
          );
        });

        // Emit the event
        let creationsFromCopyEvent: (EventObject | undefined)[] =
          await Promise.all(promises);
        const creationsFromCopyEventBatchValidated =
          creationsFromCopyEvent.filter(
            (creationFromCopyEvent) => creationFromCopyEvent
          ) as EventObject[];
        if (creationsFromCopyEventBatchValidated.length) {
          this.emitEvent(creationsFromCopyEventBatchValidated);
        }
        this.canvas.renderAll();
      })
    );

    // handle render others created object
    this.subscription.add(
      this.receivedEventObject$.subscribe((eventObjects: EventObject[]) => {
        // for debugging purpose
        console.log('draw event:', eventObjects[0].command);
        console.log(eventObjects);
        this.sequencePrinter();

        eventObjects.map(async (eventObject) => {
          switch (eventObject.command) {
            case CommandType.Create: {
              await this.createCanvasObjectFromData(
                eventObject,
                CreateFromDataType.RECEIVEDEVENT
              );
              break;
            }
          }
        });
        this.canvas.renderAll();
      })
    );
  }

  // emit current event to redo undo service
  private emitEvent(event: EventObject[]) {
    this._redoUndoService.emitEvent(event);
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
    this.emitEvent([creationEvent]);
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

  // Allow to create canvas object from other source of data, clone of existing fabric.Objects or from
  // other users created EventObjects
  private async createCanvasObjectFromData(
    createFromSource: EventObject | fabric.Object,
    createFromDataType: CreateFromDataType
  ): Promise<fabric.Object> {
    let newObjectProperties = {};
    let createdObject = new fabric.Object();
    let _alternativeDrawer;
    let typeOfObject;
    let createFrom: PropertiesSnapShot | fabric.Object;

    let position: PositionType;

    if (createFromDataType === CreateFromDataType.CLONE) {
      typeOfObject = (createFromSource as fabric.Object).type;
      createFrom = createFromSource as fabric.Object;
      let positionWithoutOffset: PositionType = getObjectAbsolutePosition(
        createFrom as fabric.Object
      );
      position = {
        left: positionWithoutOffset.left + 10,
        top: positionWithoutOffset.top + 10,
      };
    } else {
      typeOfObject = (createFromSource as EventObject).canvasObjectType;
      createFrom = (createFromSource as EventObject)
        .snapShotAfter as PropertiesSnapShot;
      position = {
        left: createFrom.left ?? 0,
        top: createFrom.top ?? 0,
      };
    }

    Object.assign(newObjectProperties, {
      ...this.drawerOptions,
      stroke: createFrom.stroke,
      strokeWidth: createFrom.strokeWidth,
      originX: createFrom.originX,
      originY: createFrom.originY,
    });

    switch (typeOfObject) {
      case ObjectType.Line: {
        _alternativeDrawer = this.drawers[0];
        const typeSpecificObject =
          createFromDataType === CreateFromDataType.CLONE
            ? (createFrom as ILineOptions)
            : (createFrom as PropertiesSnapShot);
        Object.assign(newObjectProperties, {
          left: position.left,
          top: position.top,
        });
        createdObject = await _alternativeDrawer.make(
          typeSpecificObject.x1 ? typeSpecificObject.x1 : position.left,
          typeSpecificObject.y1 ? typeSpecificObject.y1 : position.top,
          newObjectProperties,
          typeSpecificObject.x2,
          typeSpecificObject.y2
        );
        break;
      }
      case ObjectType.Rectangle: {
        _alternativeDrawer = this.drawers[1];
        const typeSpecificObject =
          createFromDataType === CreateFromDataType.CLONE
            ? (createFrom as fabric.Rect)
            : (createFrom as PropertiesSnapShot);
        Object.assign(newObjectProperties, {
          width: typeSpecificObject.width,
          height: typeSpecificObject.height,
        });
        createdObject = await _alternativeDrawer.make(
          position.left,
          position.top,
          newObjectProperties
        );
        break;
      }
      case ObjectType.Circle: {
        _alternativeDrawer = this.drawers[2];
        const typeSpecificObject =
          createFromDataType === CreateFromDataType.CLONE
            ? (createFrom as fabric.Circle)
            : (createFrom as PropertiesSnapShot);
        Object.assign(newObjectProperties, {
          radius: typeSpecificObject.radius,
        });
        createdObject = await _alternativeDrawer.make(
          position.left,
          position.top,
          newObjectProperties,
          typeSpecificObject.radius
        );
        break;
      }
      case ObjectType.Path: {
        _alternativeDrawer = this.drawers[3];
        const typeSpecificObject =
          createFromDataType === CreateFromDataType.CLONE
            ? (createFrom as fabric.Path)
            : (createFrom as PropertiesSnapShot);
        Object.assign(newObjectProperties, {
          path: typeSpecificObject.path,
          left: position.left,
          top: position.top,
        });
        createdObject = await _alternativeDrawer.make(
          position.left,
          position.top,
          newObjectProperties,
          undefined,
          undefined,
          typeSpecificObject.path
        );
        break;
      }
    }
    if (createdObject) {
      if (createFromDataType === CreateFromDataType.CLONE) {
        this.canvas.add(createdObject);
      } else {
        this.canvas.insertAt(
          createdObject,
          (createFromSource as EventObject).canvasObjectId,
          false
        );
      }
    }
    return createdObject;
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
      originX: tobeCloned.originX,
      originY: tobeCloned.originY,
    });

    let position: PositionType = getObjectAbsolutePosition(tobeCloned);

    switch (tobeCloned.type) {
      case ObjectType.Line: {
        _alternativeDrawer = this.drawers[0];
        const typeSpecificObject = tobeCloned as ILineOptions;
        Object.assign(tobeCloneProperties, {
          left: position.left + 10,
          top: position.top + 10,
        });
        clonedObject = await _alternativeDrawer.make(
          typeSpecificObject.x1 ? typeSpecificObject.x1 : position.left + 10,
          typeSpecificObject.y1 ? typeSpecificObject.y1 : position.top + 10,
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
          position.left + 10,
          position.top + 10,
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
          position.left + 10,
          position.top + 10,
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
          left: position.left + 10,
          top: position.top + 10,
        });
        clonedObject = await _alternativeDrawer.make(
          position.left + 10,
          position.top + 10,
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
  private async handleDelete() {
    if (this.cursorMode === CursorMode.Select) {
      let deletionEventsBatch: (EventObject | undefined)[] = [];
      const promises = this.canvas
        .getActiveObjects()
        .map(async (activeObject) => {
          var index = this.canvas.getObjects().indexOf(activeObject);

          let _alternativeDrawer;
          // Do the actual deletion
          switch (activeObject.type) {
            case 'line': {
              _alternativeDrawer = this.drawers[0];
              this.canvas._objects[index] = await _alternativeDrawer.make(
                0,
                0,
                this._canvasToEventObjectCorrelationService.ghostObjectProperty,
                0,
                0
              );
              break;
            }
            case 'rect': {
              _alternativeDrawer = this.drawers[1];
              this.canvas._objects[index] = await _alternativeDrawer.make(
                0,
                0,
                this._canvasToEventObjectCorrelationService.ghostObjectProperty
              );
              break;
            }
            case 'circle': {
              _alternativeDrawer = this.drawers[2];
              this.canvas._objects[index] = await _alternativeDrawer.make(
                0,
                0,
                this._canvasToEventObjectCorrelationService.ghostObjectProperty,
                0
              );
              break;
            }
            case 'path': {
              _alternativeDrawer = this.drawers[3];
              this.canvas._objects[index] = await _alternativeDrawer.make(
                0,
                0,
                this._canvasToEventObjectCorrelationService.ghostObjectProperty,
                undefined,
                undefined,
                [['M', 0, 0]]
              );
              break;
            }
          }
          // Create a delete event object
          return this._redoUndoService.buildDeletionEventObject(
            index + 1,
            activeObject,
            {
              ...this.drawerOptions,
              stroke: activeObject.stroke,
              strokeWidth: activeObject.strokeWidth,
            }
          );
        });

      // Emit the events
      deletionEventsBatch = await Promise.all(promises);
      const deletionEventsBatchValidate = deletionEventsBatch.filter(
        (deletionEvent) => deletionEvent
      ) as EventObject[];
      if (deletionEventsBatchValidate.length) {
        this.emitEvent(deletionEventsBatchValidate);
      }

      // Need to de-select everything, since after delection we don't want to see the selection box
      this.canvas.discardActiveObject().renderAll();
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
  private async undoCreationEvent(
    undoEvent: EventObject,
    canvasObjectLocator: Function,
    additionalProperty: any
  ) {
    const canvasObjectLocation = canvasObjectLocator();
    // still not the best way for handling redo & undo, since the logic here is
    // still re-assgin to new object, which doesn't give flexibility for real
    // deletion.
    let _alternativeDrawer;
    switch (undoEvent.canvasObjectType) {
      case 'line': {
        _alternativeDrawer = this.drawers[0];
        this.canvas._objects[canvasObjectLocation] =
          await _alternativeDrawer.make(0, 0, additionalProperty, 0, 0);
        break;
      }
      case 'rect': {
        _alternativeDrawer = this.drawers[1];
        this.canvas._objects[canvasObjectLocation] =
          await _alternativeDrawer.make(0, 0, additionalProperty);
        break;
      }
      case 'circle': {
        _alternativeDrawer = this.drawers[2];
        this.canvas._objects[canvasObjectLocation] =
          await _alternativeDrawer.make(0, 0, additionalProperty, 0);
        break;
      }
      case 'path': {
        _alternativeDrawer = this.drawers[3];
        this.canvas._objects[canvasObjectLocation] =
          await _alternativeDrawer.make(
            0,
            0,
            additionalProperty,
            undefined,
            undefined,
            [['M', 0, 0]]
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
  private async redoDeletionEvent(
    redoEvent: EventObject,
    canvasObjectLocator: Function,
    additionalProperty: any
  ) {
    const canvasObjectLocation = canvasObjectLocator();
    let _alternativeDrawer;
    // still not the best way for handling redo & undo, since the logic here is
    // still re-assgin to new object, which doesn't give flexibility for real
    // deletion.
    switch (redoEvent.canvasObjectType) {
      case 'line': {
        _alternativeDrawer = this.drawers[0];
        this.canvas._objects[canvasObjectLocation] =
          await _alternativeDrawer.make(0, 0, additionalProperty, 0, 0);
        break;
      }
      case 'rect': {
        _alternativeDrawer = this.drawers[1];
        this.canvas._objects[canvasObjectLocation] =
          await _alternativeDrawer.make(0, 0, additionalProperty);
        break;
      }
      case 'circle': {
        _alternativeDrawer = this.drawers[2];
        this.canvas._objects[canvasObjectLocation] =
          await _alternativeDrawer.make(0, 0, additionalProperty, 0);
        break;
      }
      case 'path': {
        _alternativeDrawer = this.drawers[3];
        this.canvas._objects[canvasObjectLocation] =
          await _alternativeDrawer.make(
            0,
            0,
            additionalProperty,
            undefined,
            undefined,
            [['M', 0, 0]]
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

  private sequencePrinter() {
    console.log('--sequence--');
    const allObjects = this.canvas.getObjects();
    allObjects.forEach((object, index) => {
      console.log(index, object.type);
    });
  }
}
