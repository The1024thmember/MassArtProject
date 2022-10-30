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

export const enum ObjectType {
  Line = 'line',
  Rectangle = 'rect',
  Circle = 'circle',
}

export const enum CursorMode {
  Draw,
  Select,
}

export const enum ChangeObjectProperty {
  StrokeWeight,
  StrokeColor,
}

export const enum BorderColor {
  xxxlight = '#bec0c2',
  xxlight = '#75787d',
  xlight = '#4d525b',
  light = '#363f4d',
  dark = '#2b3340',
  xdark = '#1f2836',
  xxdark = '#161e2c',
  xxxdark = '#0e1724',
  xxxxdark = '#000',
}

export const enum CornerSize {
  desktop = 10,
  tablet = 8,
  mobile = 6,
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

  readonly changeProperty: (
    object: any,
    option: ChangeObjectProperty,
    value: string
  ) => Promise<fabric.Object>;
}
