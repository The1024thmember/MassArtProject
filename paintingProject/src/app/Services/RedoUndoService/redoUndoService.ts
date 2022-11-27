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
  emittedUndoEventObject$: Rx.Subject<EventObject>; // To emit the result of undo action
  emittedRedoEventObject$: Rx.Subject<EventObject>; // To emit the result of redo action
  private eventLisenter = new Rx.Subject<EventObject>(); // To listen to the stream of canvas event
  private undoAction = new Rx.Subject<boolean>();
  private redoAction = new Rx.Subject<boolean>();
  private subscription = new Rx.Subscription();

  constructor(
    emittedUndoEventObject: Rx.Subject<EventObject>,
    emittedRedoEventObject: Rx.Subject<EventObject>
  ) {
    this.emittedUndoEventObject$ = emittedUndoEventObject;
    this.emittedRedoEventObject$ = emittedRedoEventObject;
    this.initializer();
  }

  public emitEvent(event: EventObject) {
    this.eventLisenter.next(event);
  }

  public undo() {
    this.undoAction.next(true);
    console.log('this.undoStack:', this.undoStack);
  }

  public redo() {
    this.redoAction.next(true);
    console.log('this.redoStack:', this.redoStack);
  }

  private initializer() {
    this.subscription.add(
      this.eventLisenter.subscribe((event) => {
        console.log('event received:', event);
        this.undoStack.push(event);
        // some logic then fire backend request
      })
    );

    this.subscription.add(
      this.undoAction.subscribe((isUndo) => {
        console.log('undo received:', isUndo);
        this.emitUndoEvent();
      })
    );

    this.subscription.add(
      this.redoAction.subscribe((isRedo) => {
        console.log('redo received:', isRedo);
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
  }

  private emitRedoEvent() {
    const poppedEvent = this.redoStack.pop();
    if (poppedEvent) {
      this.emittedRedoEventObject$.next(poppedEvent);
      this.undoStack.push(poppedEvent);
    }
  }
}
