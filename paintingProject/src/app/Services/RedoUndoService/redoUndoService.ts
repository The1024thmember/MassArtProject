import {
  ICircleOptions,
  ILineOptions,
  IPathOptions,
  IRectOptions,
} from 'fabric/fabric-impl';
import * as Rx from 'rxjs';
import { ObjectType } from '../DrawerService';
import { CommandType, EventObject } from './types';
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
  private eventLisenter = new Rx.Subject<EventObject[]>(); // To listen to the stream of canvas event
  private undoAction = new Rx.Subject<boolean>();
  private redoAction = new Rx.Subject<boolean>();
  private subscription = new Rx.Subscription();

  constructor(
    emittedUndoEventObject: Rx.Subject<EventObject[]>,
    emittedRedoEventObject: Rx.Subject<EventObject[]>
  ) {
    this.emittedUndoEventObject$ = emittedUndoEventObject;
    this.emittedRedoEventObject$ = emittedRedoEventObject;
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
        const lineObjectBefore = canvasObjectBefore as ILineOptions;
        Object.assign(eventObject.snapShotBefore, {
          left: lineObjectBefore.left,
          top: lineObjectBefore.top,
        });
        const lineObjectAfter = canvasObjectAfter as ILineOptions;
        Object.assign(eventObject.snapShotAfter, {
          left: lineObjectAfter.left,
          top: lineObjectAfter.top,
        });
        break;
      }
      case ObjectType.Rectangle: {
        eventObject.canvasObjectType = ObjectType.Rectangle;
        const rectObjectBefore = canvasObjectBefore as IRectOptions;
        Object.assign(eventObject.snapShotBefore, {
          left: rectObjectBefore.left,
          top: rectObjectBefore.top,
          width: rectObjectBefore.width,
          height: rectObjectBefore.height,
        });
        const rectObjectAfter = canvasObjectAfter as IRectOptions;
        Object.assign(eventObject.snapShotAfter, {
          left: rectObjectAfter.left,
          top: rectObjectAfter.top,
          width: rectObjectAfter.width,
          height: rectObjectAfter.height,
        });
        break;
      }
      case ObjectType.Circle: {
        eventObject.canvasObjectType = ObjectType.Circle;
        const circleObjectBefore = canvasObjectBefore as ICircleOptions;
        Object.assign(eventObject.snapShotBefore, {
          left: circleObjectBefore.left,
          top: circleObjectBefore.top,
          radius: circleObjectBefore.radius,
        });
        const circleObjectAfter = canvasObjectAfter as ICircleOptions;
        Object.assign(eventObject.snapShotAfter, {
          left: circleObjectAfter.left,
          top: circleObjectAfter.top,
          radius: circleObjectAfter.radius,
        });
        break;
      }
      case ObjectType.Path: {
        eventObject.canvasObjectType = ObjectType.Path;
        const pathObjectBefore = canvasObjectBefore as IPathOptions;
        Object.assign(eventObject.snapShotBefore, {
          path: pathObjectBefore.path,
          left: pathObjectBefore.left,
          top: pathObjectBefore.top,
        });
        const pathObjectAfter = canvasObjectAfter as IPathOptions;
        Object.assign(eventObject.snapShotAfter, {
          path: pathObjectAfter.path,
          left: pathObjectAfter.left,
          top: pathObjectAfter.top,
        });
        break;
      }
    }
    //Set position, width/height data, and appending draweroptions for rect,circle and line Object
    Object.assign(eventObject.snapShotAfter, {
      angle: canvasObjectAfter.angle,
      originX: canvasObjectAfter.originX,
      originY: canvasObjectAfter.originY,
      scaleX: canvasObjectAfter.scaleX,
      scaleY: canvasObjectAfter.scaleY,
      stroke: canvasObjectAfter.stroke,
      strokeWidth: canvasObjectAfter.strokeWidth,
    });

    Object.assign(eventObject.snapShotBefore, {
      angle: canvasObjectBefore.angle,
      originX: canvasObjectBefore.originX,
      originY: canvasObjectBefore.originY,
      scaleX: canvasObjectBefore.scaleX,
      scaleY: canvasObjectBefore.scaleY,
      stroke: canvasObjectBefore.stroke,
      strokeWidth: canvasObjectBefore.strokeWidth,
    });

    //Need to record .canvas property as well, otherwise undo redo creation then switch to selection will be buggy
    eventObject.canvasObjectId = canvasObjectId;
    eventObject._canvas = canvasObjectBefore.canvas;
    eventObject.command = CommandType.ChangeProperty;
    console.log('assmly property change event');
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

        Object.assign(
          eventObject.snapShotBefore,
          this.getObjectAbsolutePosition(canvasObjectBefore)
        );
        break;
      }
      case ObjectType.Rectangle: {
        eventObject.canvasObjectType = ObjectType.Rectangle;
        const rectObject = canvasObjectBefore as IRectOptions;
        eventObject.snapShotBefore = {
          width: rectObject.width,
          height: rectObject.height,
        };
        Object.assign(
          eventObject.snapShotBefore,
          this.getObjectAbsolutePosition(canvasObjectBefore)
        );
        break;
      }
      case ObjectType.Circle: {
        eventObject.canvasObjectType = ObjectType.Circle;
        const circleObject = canvasObjectBefore as ICircleOptions;
        eventObject.snapShotBefore = {
          radius: circleObject.radius,
        };
        Object.assign(
          eventObject.snapShotBefore,
          this.getObjectAbsolutePosition(canvasObjectBefore)
        );
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
    });
    eventObject._canvas = canvasObjectBefore.canvas;
    return eventObject;
  }

  public buildCreationEventObject(
    canvasObjectId: number,
    canvasObject: fabric.Object,
    additionalProperties: object
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
    });

    //Need to record .canvas property as well, otherwise undo redo creation then switch to selection will by buggy
    eventObject.canvasObjectId = canvasObjectId;
    eventObject._canvas = canvasObject.canvas;
    eventObject.command = CommandType.Create;

    return eventObject;
  }

  public emitEvent(event: EventObject[]) {
    this.eventLisenter.next(event);
  }

  public undo() {
    this.undoAction.next(true);
  }

  public redo() {
    this.redoAction.next(true);
  }

  private initializer() {
    this.subscription.add(
      this.eventLisenter.subscribe((event) => {
        this.undoStack.push(event);
        // some logic then fire backend request
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
      console.log('poppedEvent adding on redo stack:', poppedEvent);
      this.redoStack.push(poppedEvent);
    }
  }

  private emitRedoEvent() {
    const poppedEvent = this.redoStack.pop();
    if (poppedEvent) {
      this.emittedRedoEventObject$.next(poppedEvent);
      console.log('poppedEvent adding on undo stack:', poppedEvent);
      this.undoStack.push(poppedEvent);
    }
  }

  private getObjectAbsolutePosition(canvasObject: fabric.Object): object {
    // Getting the position of the object, if its group selection, then need to do calculation
    // refer to: https://stackoverflow.com/a/29926545
    var topFromCanvas = canvasObject.top ? canvasObject.top : 0;
    var leftFromCanvas = canvasObject.left ? canvasObject.left : 0;

    if (canvasObject.group) {
      const leftFromGroup = canvasObject.group.left
        ? canvasObject.group.left
        : 0;
      const widthOfGroup = canvasObject.group.width
        ? canvasObject.group.width
        : 0;
      const topFromGroup = canvasObject.group.top ? canvasObject.group.top : 0;
      const heightOfGroup = canvasObject.group.height
        ? canvasObject.group.height
        : 0;

      topFromCanvas = topFromGroup + topFromCanvas + heightOfGroup / 2;
      leftFromCanvas = leftFromGroup + leftFromCanvas + widthOfGroup / 2;
    }

    return { top: topFromCanvas, left: leftFromCanvas };
  }
}
