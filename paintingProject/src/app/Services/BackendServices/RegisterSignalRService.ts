import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
// Connects to http://127.0.0.1:5000/register websocket
@Injectable({
  providedIn: 'root',
})
export class RegisterSocketService {
  private socketio: Socket;

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.socketio = io('http://127.0.0.1:5000/register');

    this.socketio.on('connect', () => {
      console.log('Register Connected');
    });

    this.socketio.on('disconnect', () => {
      console.log('Register Disconnected');
    });

    this.socketio.on('message', (msg) => {
      console.log('received others registeration event:', msg);
    });
  }

  public sendEvent(event: string) {
    this.socketio.emit('message', event);
  }
}
