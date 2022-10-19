import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
@Injectable({
  providedIn: 'root',
})
export class CanvasDragAndDropService {
  //constructor(private _canvas: fabric.Canvas) {}

  getStartPosition(event: any) {
    /*
    var pointer = this._canvas.getPointer(event.e);
    var posX = pointer.x;
    var posY = pointer.y;
    console.log(posX + ', ' + posY); // Log to console
    */
    console.log(`start position: (x,y): ${event.e.clientX},${event.e.clientY}`);
    document.addEventListener('mousemove', this.onMouseUpdate, false);

    new fabric.Line(
      [event.e.clientX, event.e.clientY, event.e.clientX, event.e.clientY],
      {
        stroke: 'black',
      }
    );

    return event.e.clientX, event.e.clientY;
  }

  getEndPosition(event: any) {
    /*
    var pointer = this._canvas.getPointer(event.e);
    var posX = pointer.x;
    var posY = pointer.y;
    console.log(posX + ', ' + posY); // Log to console
    */
    console.log(`end position: (x,y): ${event.e.clientX},${event.e.clientY}`);
    document.removeEventListener('mousemove', this.onMouseUpdate, false);
    return event.e.clientX, event.e.clientY;
  }

  onMouseUpdate(event: any) {
    var x = event.pageX;
    var y = event.pageY;
  }
}
