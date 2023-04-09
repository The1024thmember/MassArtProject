import { Point } from 'fabric/fabric-impl';
import { ObjectType } from '../DrawerService';

export const enum CommandType {
  Create = 'create',
  Delete = 'delete',
  ChangeProperty = 'changeProperty',
}

export class EventObject {
  public id: number; // event id
  public canvasObjectId: number; // canvas object id attached with this event
  public canvasObjectType: ObjectType;
  public command: CommandType;
  public snapShotBefore: PropertiesSnapShot;
  public snapShotAfter: PropertiesSnapShot;
  public _canvas: fabric.Canvas | undefined;
}

export class PropertiesSnapShot {
  left?: number;
  top?: number;
  stroke?: string;
  strokeWidth?: number;
  originX?: string;
  originY?: string;
  width?: number;
  height?: number;
  radius?: number;
  path?: Point[];
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}
