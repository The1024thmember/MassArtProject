import { fabric } from 'fabric';
import { ChangeObjectProperty, DrawingMode, IObjectDrawer } from './types';

export class LineDrawer implements IObjectDrawer {
  drawingMode: DrawingMode = DrawingMode.Line;
  make(
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Object> {
    //Return a Promise that will draw a line
    return new Promise<fabric.Object>((resolve) => {
      //Inside the Promise, draw the actual line from (x,y) to (x2,y2)
      const object = new fabric.Line([x, y, x2 ? x2 : x, y2 ? y2 : y], {
        ...options,
      });
      object.setControlsVisibility({
        ml: false,
        mt: false,
        bl: false,
        tl: false,
        tr: false,
      });
      resolve(object);
    });
  }

  resize(
    object: fabric.Line,
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
        x2: x,
        y2: y,
        ...options,
      })
      .setCoords();

    //Wrap the resized object in a Promise
    return new Promise<fabric.Object>((resolve) => {
      resolve(object);
    });
  }

  changeProperty(
    object: fabric.Line,
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
