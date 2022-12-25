import { fabric } from 'fabric';
import { ChangeObjectProperty, DrawingMode, IObjectDrawer } from './types';

export class RectDrawer implements IObjectDrawer {
  private origX: number;
  private origY: number;
  drawingMode: DrawingMode = DrawingMode.Rectangle;
  make(
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    width?: number,
    height?: number
  ): Promise<fabric.Object> {
    this.origX = x;
    this.origY = y;
    //Return a Promise that will draw a line
    return new Promise<fabric.Object>((resolve) => {
      //Inside the Promise, draw the actual line from (x,y) to (x2,y2)
      resolve(
        new fabric.Rect({
          left: x,
          top: y,
          width: width ? width : 0,
          height: height ? height : 0,
          ...options,
        })
      );
    });
  }

  resize(
    object: fabric.Rect,
    x: number,
    y: number,
    options?: fabric.IObjectOptions,
    canvas?: fabric.Canvas
  ): Promise<fabric.Object> {
    object
      .set({
        originX: this.origX > x ? 'right' : 'left',
        originY: this.origY > y ? 'bottom' : 'top',
        width: Math.abs(this.origX - x),
        height: Math.abs(this.origY - y),
        ...options,
      })
      .setCoords();

    //Wrap the resized object in a Promise
    return new Promise<fabric.Object>((resolve) => {
      resolve(object);
    });
  }

  changeProperty(
    object: fabric.Rect,
    option: ChangeObjectProperty,
    value: string
  ): Promise<fabric.Object> {
    switch (option) {
      case ChangeObjectProperty.StrokeColor:
        object.set({
          stroke: value,
        });
        break;
      case ChangeObjectProperty.StrokeWeight:
        object.set({
          strokeWidth: parseInt(value),
        });
        break;
    }

    //Wrap the resized object in a Promise
    return new Promise<fabric.Object>((resolve) => {
      resolve(object);
    });
  }
}
