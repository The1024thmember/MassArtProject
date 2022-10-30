import { fabric } from 'fabric';
import { BorderColor, CornerSize, DrawingMode, IObjectDrawer } from './types';

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
          borderColor: BorderColor.xxxlight,
          cornerColor: BorderColor.xxlight,
          transparentCorners: false,
          cornerSize: CornerSize.desktop,
          hoverCursor: 'default',
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
}
