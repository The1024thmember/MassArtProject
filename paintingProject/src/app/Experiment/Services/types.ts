export const enum DrawingMode {
  Line,
  Rectangle,
  Circle,
  Oval,
  Polyline,
  Path,
  Text,
  Triangle,
}

export const enum CursorMode {
  Draw,
  Select,
}

export interface IObjectDrawer {
  drawingMode: DrawingMode;
  //Makes the current object
  readonly make: (
    x: number, //Horizontal starting point
    y: number, //Vertical starting point
    options: fabric.IObjectOptions,
    x2?: number, //Horizontal ending point
    y2?: number //Vertical ending point
  ) => Promise<fabric.Object>;
  //Resizes the object (used during the mouseOver event below)

  readonly resize: (
    object: any,
    x: number,
    y: number
  ) => Promise<fabric.Object>;
}
