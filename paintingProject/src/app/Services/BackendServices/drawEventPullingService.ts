import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class DrawEventSocketService {
  private socket: Socket;
  private messages: Array<any>;
  constructor(private http: HttpClient) {}

  public iniServerSocket() {
    this.http.get('http://127.0.0.1:5000/api').subscribe((data) => {
      console.log(data);
    });
  }
}
