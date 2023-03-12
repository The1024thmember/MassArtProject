import { Component, OnInit } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { Margin } from 'src/app/Directives/Margin/margin.directive';
import { SocketService } from './websocketService';

@Component({
  selector: 'landingPage-Objectives',
  template: ` <my-container>
    <my-grid>
      <my-col [colDesktopSmall]="6">
        <my-heading [headingType]="HeadingType.H1">
          The Art of Togetherness
        </my-heading>
      </my-col>
      <my-col [colDesktopSmall]="5" [colTablet]="12">
        <my-heading [headingType]="HeadingType.H1">2</my-heading>
      </my-col>
    </my-grid>
    <my-grid>
      <my-col [colDesktopSmall]="5" [colTablet]="12">
        <my-button (click)="sendMessage()">Click Me To Send Message</my-button>
      </my-col>
      <my-col [colDesktopSmall]="5" [colTablet]="12">
        <my-button (click)="sendNews('This is the news sent from front-end')"
          >Click Me To Send News</my-button
        >
      </my-col>
    </my-grid>
  </my-container>`,
})
export class LandingPageObjectiveComponent implements OnInit {
  HeadingType = HeadingType;
  Margin = Margin;

  private socketio: Socket;
  constructor(private socket: SocketService) {}

  ngOnInit(): void {
    this.socketio = io('http://127.0.0.1:5000');
    this.socket.iniServerSocket();

    this.socketio.on('connect', () => {
      console.log('Frontend Connected');
    });

    this.socketio.on('disconnect', () => {
      console.log('Disconnected');
    });
  }

  sendNews(message: string) {
    this.socketio.emit('news', message);
    console.log('emit news');
  }

  sendMessage() {
    this.socketio.send(Math.random().toString());
    console.log('send Message');
  }
}
