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
  public snapShotBefore: object;
  public snapShotAfter: object;
}
