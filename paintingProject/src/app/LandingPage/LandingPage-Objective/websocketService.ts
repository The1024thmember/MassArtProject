import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private messages: Array<any>;
  constructor(private http: HttpClient) {}

  public iniServerSocket() {
    this.http.get('http://127.0.0.1:5000').subscribe((data) => {
      console.log(data);
    });
  }
}
