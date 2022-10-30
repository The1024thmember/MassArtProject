import { fabric } from 'fabric';
import { BorderColor, CornerSize, DrawingMode, IObjectDrawer } from './types';

export class CircleDrawer implements IObjectDrawer {
  drawingMode: DrawingMode = DrawingMode.Circle;
  origX: number;
  origY: number;
  readonly defaultRadius: number = 3;
  make(
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    radius?: number
  ): Promise<fabric.Object> {
    //Return a Promise that will draw a circle
    this.origX = x;
    this.origY = y;
    return new Promise<fabric.Object>((resolve) => {
      //Inside the Promise, draw the actual line from (x,y) to (x2,y2)
      resolve(
        new fabric.Circle({
          left: x,
          top: y,
          ...options,
          selectable: false, //creating by default is non selectable
          hasControls: false, // the control for change the width, height rotation
          hasBorders: false, // has selection border
          borderColor: BorderColor.xxxlight,
          cornerColor: BorderColor.xxlight,
          transparentCorners: false,
          cornerSize: CornerSize.desktop,
          radius: radius ? radius : 0,
          hoverCursor: 'default',
        })
      );
    });
  }

  resize(object: fabric.Circle, x: number, y: number): Promise<fabric.Object> {
    //Change the secondary point (x2, y2) of the object
    //This resizes the object between starting point (x,y)
    //and secondary point (x2,y2), where x2 and y2 have new values.
    object
      .set({
        originX: this.origX > x ? 'right' : 'left',
        originY: this.origY > y ? 'bottom' : 'top',
        radius: Math.max(
          Math.min(Math.abs(x - this.origX), Math.abs(y - this.origY)),
          this.defaultRadius
        ),
      })
      .setCoords();

    //Wrap the resized object in a Promise
    return new Promise<fabric.Object>((resolve) => {
      resolve(object);
    });
  }
}
