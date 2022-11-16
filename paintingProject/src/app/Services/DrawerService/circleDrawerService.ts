import { fabric } from 'fabric';
import { ChangeObjectProperty, DrawingMode, IObjectDrawer } from './types';

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
    console.log('x:', x);
    console.log('y:', y);
    return new Promise<fabric.Object>((resolve) => {
      //Inside the Promise, draw the actual line from (x,y) to (x2,y2)
      resolve(
        new fabric.Circle({
          left: x,
          top: y,
          ...options,
          radius: radius ? radius : 0,
        })
      );
    });
  }

  resize(
    object: fabric.Circle,
    x: number,
    y: number,
    options?: fabric.IObjectOptions,
    canvas?: fabric.Canvas
  ): Promise<fabric.Object> {
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
        ...options,
      })
      .setCoords();

    //Wrap the resized object in a Promise
    return new Promise<fabric.Object>((resolve) => {
      resolve(object);
    });
  }

  changeProperty(
    object: fabric.Circle,
    option: ChangeObjectProperty,
    value: string
  ): Promise<fabric.Object> {
    switch (option) {
      case ChangeObjectProperty.StrokeColor:
        object.set({
          stroke: value,
        });
        console.log(`change ${object} color to be ${value}`);
        console.log(object);
        break;
      case ChangeObjectProperty.StrokeWeight:
        object.set({
          strokeWidth: parseInt(value),
        });
        console.log(`change ${object} strokeWidth to be ${value}`);
        console.log(object);
        break;
    }

    //Wrap the resized object in a Promise
    return new Promise<fabric.Object>((resolve) => {
      resolve(object);
    });
  }
}
