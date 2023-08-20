import {
  ICircleOptions,
  ILineOptions,
  IPathOptions,
  IRectOptions,
} from 'fabric/fabric-impl';
import * as Rx from 'rxjs';
import { Datastore } from 'src/app/Datastore/datastore';
import { getObjectAbsolutePosition } from 'src/app/Helpers';
import { DrawBoardSocketService } from '../BackendServices/DrawBoardSignalRService';
import { ObjectType } from '../DrawerService';
import { CommandType, EventObject, PropertiesSnapShot } from './types';
/*
  Keeps redo and undo stack
  input: event stream
  output: events for redo, undo
*/
export class RedoUndoService {
  private static STACKLIMIT: number = 10;
  private redoStack: EventObject[][] = [];
  private undoStack: EventObject[][] = [];
  emittedUndoEventObject$: Rx.Subject<EventObject[]>; // To emit the result of undo action
  emittedRedoEventObject$: Rx.Subject<EventObject[]>; // To emit the result of redo action
  isRedoable$: Rx.Subject<boolean>;
  isUndoable$: Rx.Subject<boolean>;
  private eventLisenter = new Rx.Subject<EventObject[]>(); // To listen to the stream of canvas event
  private undoAction = new Rx.Subject<boolean>();
  private redoAction = new Rx.Subject<boolean>();
  private subscription = new Rx.Subscription();

  _drawBoardSocketService: DrawBoardSocketService;

  constructor(
    emittedUndoEventObject: Rx.Subject<EventObject[]>,
    emittedRedoEventObject: Rx.Subject<EventObject[]>,
    isRedoable$: Rx.Subject<boolean>,
    isUndoable$: Rx.Subject<boolean>,
    _drawBoardSocketService: DrawBoardSocketService,
    private datastore: Datastore
  ) {
    this.emittedUndoEventObject$ = emittedUndoEventObject;
    this.emittedRedoEventObject$ = emittedRedoEventObject;
    this.isRedoable$ = isRedoable$;
    this.isUndoable$ = isUndoable$;
    this._drawBoardSocketService = _drawBoardSocketService;
    this.initializer();
  }

  public buildPropertyChangeEventObject(
    canvasObjectId: number,
    canvasObjectBefore: fabric.Object,
    canvasObjectAfter: fabric.Object,
    additionalProperties: object
  ): EventObject {
    const eventObject: EventObject = new EventObject();

    // Assign before hand to allow overwrite later, since some property may not be overwrote, don't need to re-assgin later
    eventObject.snapShotAfter = { ...additionalProperties };
    eventObject.snapShotBefore = { ...additionalProperties };
    switch (canvasObjectBefore.type) {
      case ObjectType.Line: {
        eventObject.canvasObjectType = ObjectType.Line;
        break;
      }
      case ObjectType.Rectangle: {
        eventObject.canvasObjectType = ObjectType.Rectangle;
        const rectObjectBefore = canvasObjectBefore as IRectOptions;
        Object.assign(eventObject.snapShotBefore, {
          width: rectObjectBefore.width,
          height: rectObjectBefore.height,
        });
        const rectObjectAfter = canvasObjectAfter as IRectOptions;
        Object.assign(eventObject.snapShotAfter, {
          width: rectObjectAfter.width,
          height: rectObjectAfter.height,
        });
        break;
      }
      case ObjectType.Circle: {
        eventObject.canvasObjectType = ObjectType.Circle;
        const circleObjectBefore = canvasObjectBefore as ICircleOptions;
        Object.assign(eventObject.snapShotBefore, {
          radius: circleObjectBefore.radius,
        });
        const circleObjectAfter = canvasObjectAfter as ICircleOptions;
        Object.assign(eventObject.snapShotAfter, {
          radius: circleObjectAfter.radius,
        });
        break;
      }
      case ObjectType.Path: {
        eventObject.canvasObjectType = ObjectType.Path;
        const pathObjectBefore = canvasObjectBefore as IPathOptions;
        Object.assign(eventObject.snapShotBefore, {
          path: pathObjectBefore.path,
        });
        const pathObjectAfter = canvasObjectAfter as IPathOptions;
        Object.assign(eventObject.snapShotAfter, {
          path: pathObjectAfter.path,
        });
        break;
      }
    }

    const beforeAngle = canvasObjectBefore.angle
      ? canvasObjectBefore.angle
      : canvasObjectBefore.group?.angle;

    //Set position, width/height data, and appending draweroptions for rect,circle and line Object
    Object.assign(eventObject.snapShotBefore, {
      angle: beforeAngle,
      originX: canvasObjectBefore.originX,
      originY: canvasObjectBefore.originY,
      scaleX: canvasObjectBefore.scaleX,
      scaleY: canvasObjectBefore.scaleY,
      stroke: canvasObjectBefore.stroke,
      strokeWidth: canvasObjectBefore.strokeWidth,
      ...getObjectAbsolutePosition(canvasObjectBefore),
    });

    // const positionBefore = util.transformPoint(
    //   // you can choose point of object (left/center/right, top/center/bottom)
    //   canvasObjectBefore.getPointByOrigin('left', 'top'),
    //   canvasObjectBefore.calcTransformMatrix()
    // );

    // console.log('positionBefore:', positionBefore);

    const afterAngle = canvasObjectAfter.angle
      ? canvasObjectAfter.angle
      : canvasObjectAfter.group?.angle;

    Object.assign(eventObject.snapShotAfter, {
      angle: afterAngle,
      originX: canvasObjectAfter.originX,
      originY: canvasObjectAfter.originY,
      ...canvasObjectAfter.getObjectScaling(),
      stroke: canvasObjectAfter.stroke,
      strokeWidth: canvasObjectAfter.strokeWidth,
      ...getObjectAbsolutePosition(canvasObjectAfter),
    });

    // const positionAfter = util.transformPoint(
    //   // you can choose point of object (left/center/right, top/center/bottom)
    //   canvasObjectAfter.getPointByOrigin('left', 'top'),
    //   canvasObjectAfter.calcTransformMatrix()
    // );

    // console.log('positionAfter:', positionAfter);

    //Need to record .canvas property as well, otherwise undo redo creation then switch to selection will be buggy
    eventObject.canvasObjectId = canvasObjectId;
    eventObject._canvas = canvasObjectBefore.canvas;
    eventObject.command = CommandType.ChangeProperty;
    return eventObject;
  }

  public buildDeletionEventObject(
    canvasObjectId: number,
    canvasObjectBefore: fabric.Object,
    additionalProperties: object
  ): EventObject {
    const eventObject: EventObject = new EventObject();
    switch (canvasObjectBefore.type) {
      case ObjectType.Line: {
        eventObject.canvasObjectType = ObjectType.Line;
        const lineObject = canvasObjectBefore as ILineOptions;
        eventObject.snapShotBefore = {
          x1: lineObject.x1,
          y1: lineObject.y1,
          x2: lineObject.x2,
          y2: lineObject.y2,
        };

        Object.assign(eventObject.snapShotBefore);
        break;
      }
      case ObjectType.Rectangle: {
        eventObject.canvasObjectType = ObjectType.Rectangle;
        const rectObject = canvasObjectBefore as IRectOptions;
        eventObject.snapShotBefore = {
          width: rectObject.width,
          height: rectObject.height,
        };
        Object.assign(eventObject.snapShotBefore);
        break;
      }
      case ObjectType.Circle: {
        eventObject.canvasObjectType = ObjectType.Circle;
        const circleObject = canvasObjectBefore as ICircleOptions;
        eventObject.snapShotBefore = {
          radius: circleObject.radius,
        };
        Object.assign(eventObject.snapShotBefore);
        break;
      }
      case ObjectType.Path: {
        eventObject.canvasObjectType = ObjectType.Path;
        const pathObject = canvasObjectBefore as IPathOptions;
        eventObject.snapShotBefore = {
          path: pathObject.path,
          left: pathObject.left,
          top: pathObject.top,
        };
        break;
      }
    }
    eventObject.canvasObjectId = canvasObjectId;
    eventObject.command = CommandType.Delete;
    eventObject.snapShotAfter = {};
    //Set position, width/height data, and appending draweroptions for rect,circle and line Object
    Object.assign(eventObject.snapShotBefore, {
      ...additionalProperties,
      angle: canvasObjectBefore.angle,
      scaleX: canvasObjectBefore.scaleX,
      scaleY: canvasObjectBefore.scaleY,
      originX: canvasObjectBefore.originX,
      originY: canvasObjectBefore.originY,
      ...getObjectAbsolutePosition(canvasObjectBefore),
    });
    eventObject._canvas = canvasObjectBefore.canvas;
    return eventObject;
  }

  public buildCreationEventObject(
    canvasObjectId: number,
    canvasObject: fabric.Object,
    additionalProperties: PropertiesSnapShot
  ): EventObject {
    const eventObject: EventObject = new EventObject();
    switch (canvasObject.type) {
      case ObjectType.Line: {
        eventObject.canvasObjectType = ObjectType.Line;
        const lineObject = canvasObject as ILineOptions;
        eventObject.snapShotAfter = {
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
        eventObject.canvasObjectType = ObjectType.Rectangle;
        const rectObject = canvasObject as IRectOptions;
        eventObject.snapShotAfter = {
          left: rectObject.left,
          top: rectObject.top,
          width: rectObject.width,
          height: rectObject.height,
        };
        break;
      }
      case ObjectType.Circle: {
        eventObject.canvasObjectType = ObjectType.Circle;
        const circleObject = canvasObject as ICircleOptions;
        eventObject.snapShotAfter = {
          left: circleObject.left,
          top: circleObject.top,
          radius: circleObject.radius,
        };
        break;
      }
      case ObjectType.Path: {
        eventObject.canvasObjectType = ObjectType.Path;
        const pathObject = canvasObject as IPathOptions;
        eventObject.snapShotAfter = {
          path: pathObject.path,
        };
        break;
      }
    }
    eventObject.snapShotBefore = {};
    //Set position, width/height data, and appending draweroptions for rect,circle and line Object
    Object.assign(eventObject.snapShotAfter, {
      ...additionalProperties,
      originX: canvasObject.originX,
      originY: canvasObject.originY,
      ...getObjectAbsolutePosition(canvasObject),
    });

    //Need to record .canvas property as well, otherwise undo redo creation then switch to selection will by buggy
    eventObject.canvasObjectId = canvasObjectId;
    eventObject._canvas = canvasObject.canvas;
    eventObject.command = CommandType.Create;
    return eventObject;
  }

  public emitEvent(event: EventObject[]) {
    this.eventLisenter.next(event);
    // send all the event to backend
    // this._drawBoardSocketService.sendEvent(event);

    // send WS draw events use websocket
    this.datastore
      .createDocument('WS', 'drawEvents', event, {
        requestId: new Date().toLocaleTimeString(),
      })
      .then((response) => {
        console.error('ws response for new doc:', response);
      });
  }

  public undo() {
    this.undoAction.next(true);
  }

  public redo() {
    this.redoAction.next(true);
  }

  private initializer() {
    this.subscription.add(
      this.eventLisenter.subscribe((event: EventObject[]) => {
        // If during redo process have new event coming in, then all the existing redo should delete
        // and the previous redo events that passed on undo stack should also be deleted.
        this.redoStack = [];
        // push the new event into undo stack
        this.undoStack.push(event);
        // some logic then fire backend request
        this.isUndoable$.next(!!this.undoStack.length);
        this.isRedoable$.next(!!this.redoStack.length);

        console.log('created new draw event:', event[0].command);
      })
    );

    this.subscription.add(
      this.undoAction.subscribe((isUndo) => {
        this.emitUndoEvent();
      })
    );

    this.subscription.add(
      this.redoAction.subscribe((isRedo) => {
        this.emitRedoEvent();
      })
    );
  }

  private emitUndoEvent() {
    const poppedEvent = this.undoStack.pop();
    if (poppedEvent) {
      this.emittedUndoEventObject$.next(poppedEvent);
      this.redoStack.push(poppedEvent);
    }
    this.isUndoable$.next(!!this.undoStack.length);
    this.isRedoable$.next(!!this.redoStack.length);
  }

  private emitRedoEvent() {
    const poppedEvent = this.redoStack.pop();
    if (poppedEvent) {
      this.emittedRedoEventObject$.next(poppedEvent);
      this.undoStack.push(poppedEvent);
    }
    this.isUndoable$.next(!!this.undoStack.length);
    this.isRedoable$.next(!!this.redoStack.length);
  }
}
