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
      resolve(
        new fabric.Line([x, y, x2 ? x2 : x, y2 ? y2 : y], {
          ...options,
          selectable: false, //creating by default is non selectable
          hasControls: false, // the control for change the width, height rotation
          hasBorders: false, // has selection border
        })
      );
    });
  }

  resize(object: fabric.Line, x: number, y: number): Promise<fabric.Object> {
    //Change the secondary point (x2, y2) of the object
    //This resizes the object between starting point (x,y)
    //and secondary point (x2,y2), where x2 and y2 have new values.
    object
      .set({
        x2: x,
        y2: y,
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
