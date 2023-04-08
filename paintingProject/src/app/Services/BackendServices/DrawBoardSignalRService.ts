import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { EventObject } from '../RedoUndoService/types';
// Connects to http://127.0.0.1:5000/exp websocket
@Injectable({
  providedIn: 'root',
})
export class DrawBoardSocketService {
  private socketio: Socket;

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
      console.log('received others draw event:', msg);
    });
  }

  public sendEvent(event: EventObject[]) {
    this.socketio.emit('message', event);
  }
}
