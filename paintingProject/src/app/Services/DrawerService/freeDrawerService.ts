import { fabric } from 'fabric';
import { ChangeObjectProperty, DrawingMode, IObjectDrawer } from './types';

export class FreeDrawer implements IObjectDrawer {
  drawingMode: DrawingMode = DrawingMode.FreeDraw;
  nodeArray: fabric.Point[] = [];
  currentObject: fabric.Path;
  drawOptions: fabric.IObjectOptions;
  make(
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Object> {
    //Return a Promise that will draw a line
    const node = ['M', x, y] as unknown as fabric.Point;
    this.nodeArray = [];
    this.nodeArray.push(node);

    //Get the drawOptions from the initial drawState
    this.drawOptions = options;

    this.currentObject = new fabric.Path(this.nodeArray, {
      fill: '',
      strokeLineCap: 'round',
      strokeMiterLimit: 10,
      strokeLineJoin: 'round',
      selectable: true,
      hasRotatingPoint: true,
      visible: true,
      ...this.drawOptions,
    });

    return new Promise<fabric.Object>((resolve) => {
      resolve(this.currentObject);
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
    const end = ['L', x, y] as unknown as fabric.Point;
    this.nodeArray.push(end);

    //The hacky way of supporting dynamic drawing of path object
    //the setCoords and set doesn't work. The solution is onmousemove
    //delete the old path object and create new path object with current node added
    if (canvas) {
      canvas.remove(this.currentObject);
    }

    this.currentObject = new fabric.Path(this.nodeArray, {
      fill: '',
      strokeLineCap: 'round',
      strokeMiterLimit: 10,
      strokeLineJoin: 'round',
      selectable: true,
      hasRotatingPoint: true,
      visible: true,
      ...this.drawOptions,
    });

    //need to add the new created object back on canvas, as resize function
    //doesn't add it
    canvas?.add(this.currentObject);

    return new Promise<fabric.Object>((resolve) => {
      resolve(this.currentObject);
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
