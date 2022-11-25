import * as Rx from 'rxjs';
import { EventObject } from './types';
/*
  Keeps redo and undo stack
  input: event stream
  output: events for redo, undo
*/
export class RedoUndoService {
  private static STACKLIMIT: number = 10;
  private redoStack: EventObject[] = [];
  private undoStack: EventObject[] = [];
  emittedUndoEventObject: Rx.Subject<EventObject>; // To emit the result of undo action
  emittedRedoEventObject: Rx.Subject<EventObject>; // To emit the result of redo action
  eventLisenter: Rx.Subject<EventObject>; // To listen to the stream of canvas event

  constructor(
    emittedUndoEventObject: Rx.Subject<EventObject>,
    emittedRedoEventObject: Rx.Subject<EventObject>
  ) {
    this.emittedUndoEventObject = emittedUndoEventObject;
    this.emittedRedoEventObject = emittedRedoEventObject;

    this.initializer();
  }

  private initializer() {
    this.eventLisenter.subscribe((event) => {
      console.log('event received:', event);
      this.undoStack.push(event);
    });
    // fire backend request
  }

  private emitUndoEvent() {
    const poppedEvent = this.undoStack.pop();
    if (poppedEvent) {
      this.emittedUndoEventObject.next(poppedEvent);
      this.redoStack.push(poppedEvent);
    }
  }

  private emitRedoEvent() {
    const poppedEvent = this.redoStack.pop();
    if (poppedEvent) {
      this.emittedRedoEventObject.next(poppedEvent);
      this.redoStack.push(poppedEvent);
    }
  }
}
