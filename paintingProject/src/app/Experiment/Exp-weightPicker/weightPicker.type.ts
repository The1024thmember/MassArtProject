export enum ColorType {
  HSVA = 'hsva',
  HSL = 'hsl',
  RGBA = 'rgba',
}

export interface HSL {
  a: number;
  h: number;
  l: number;
  s: number;
}

export interface HSV {
  a: number;
  h: number;
  v: number;
  s: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Mycolor {
  hex: string;
  hsl: HSL;
  hsv: HSV;
  rgb: RGB;
  source: ColorType;
}
