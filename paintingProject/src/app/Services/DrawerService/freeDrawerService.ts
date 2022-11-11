import { fabric } from 'fabric';
import { ChangeObjectProperty, DrawingMode, IObjectDrawer } from './types';

export class FreeDrawer implements IObjectDrawer {
  drawingMode: DrawingMode = DrawingMode.FreeDraw;
  path: string;
  make(
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Object> {
    //Return a Promise that will draw a line
    console.log('this.path:', this.path);
    this.path = `M ${x} ${y} L ${x + 1} ${y + 1}`;

    return new Promise<fabric.Object>((resolve) => {
      resolve(
        new fabric.Path(this.path, {
          strokeWidth: 2,
          stroke: 'black',
          fill: 'black',
          selectable: false,
          hasRotatingPoint: false,
          visible: true,
          ...options,
        })
      );
    });
  }

  resize(
    object: fabric.Path,
    x: number,
    y: number,
    options?: fabric.IObjectOptions
  ): Promise<fabric.Object> {
    //Change the secondary point (x2, y2) of the object
    //This resizes the object between starting point (x,y)
    //and secondary point (x2,y2), where x2 and y2 have new values.
    const node = ['L', x, y];
    object.path?.push(node as any);
    //Wrap the resized object in a Promise
    return new Promise<fabric.Object>((resolve) => {
      console.log(object.path?.length);
      resolve(object);
    });
  }

  changeProperty(
    object: fabric.Path,
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
