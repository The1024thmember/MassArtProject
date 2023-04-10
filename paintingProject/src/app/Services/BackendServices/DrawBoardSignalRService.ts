import { Injectable } from '@angular/core';
import * as Rx from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { EventObject } from '../RedoUndoService/types';
// Connects to http://127.0.0.1:5000/exp websocket
@Injectable({
  providedIn: 'root',
})
export class DrawBoardSocketService {
  private socketio: Socket;
  private drawEvents$ = new Rx.Subject<EventObject[]>();
  public drawEventsObservable$ = this.drawEvents$.asObservable();
  constructor() {
    this.initialize();
  }

  private initialize() {
    this.socketio = io('http://127.0.0.1:5000/exp');

    this.socketio.on('connect', () => {
      console.log('DrawEvent Connected');
    });

    this.socketio.on('disconnect', () => {
      console.log('DrawEvent Disconnected');
    });

    this.socketio.on('message', (msg) => {
      // need to passing the necessary function for dealing with others draw events,
      // may pass a call back function
      /* need to show the object on the front-end, but need to make sure
        1. the object does not have physical place on user created object
        2. the object can not be selected or make any modification
        but regarding (-1-), what about user's interaction with existing object, say:
        cover the whole object or try to fill the space if the current user's pating formed
        with one
      */

      this.drawEvents$.next(msg);
      /*
        use insertAt canvas default function for insert other's event object at pos x, the returned
        message will contain information of which position to insert and who is the creator (since we
        want to enable like function in the future, or attach comments on attached object)
      */
    });
  }

  public sendEvent(event: EventObject[]) {
    console.log('--sending message');
    this.socketio.emit('message', event);
  }
}
