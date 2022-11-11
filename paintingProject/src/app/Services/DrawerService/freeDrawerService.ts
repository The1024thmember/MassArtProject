import { fabric } from 'fabric';
import { ChangeObjectProperty, DrawingMode, IObjectDrawer } from './types';

export class FreeDrawer implements IObjectDrawer {
  drawingMode: DrawingMode = DrawingMode.FreeDraw;
  path: string;
  nodeArray: fabric.Point[] = [];
  make(
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Object> {
    //Return a Promise that will draw a line
    this.path = `M ${x} ${y}`;
    const node = ['M', x, y] as unknown as fabric.Point;
    this.nodeArray.push(node);
    return new Promise<fabric.Object>((resolve) => {
      resolve(
        new fabric.Path(this.nodeArray, {
          fill: '',
          strokeLineCap: 'round',
          strokeMiterLimit: 10,
          strokeLineJoin: 'round',
          selectable: true,
          hasRotatingPoint: true,
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
    options?: fabric.IObjectOptions,
    canvas?: fabric.Canvas
  ): Promise<fabric.Object> {
    //Change the secondary point (x2, y2) of the object
    //This resizes the object between starting point (x,y)
    //and secondary point (x2,y2), where x2 and y2 have new values.
    const end = ['L', x, y] as unknown as fabric.Point;
    this.nodeArray.push(end);
    object
      .set({
        path: this.nodeArray,
        ...options,
      })
      .setCoords();
    canvas?.renderAll();
    //Wrap the resized object in a Promise
    return new Promise<fabric.Object>((resolve) => {
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
