export const enum CommandType {
  Create = 'create',
  Delete = 'delete',
  ChangeProperty = 'changeProperty',
}

export interface EventObject {
  readonly id: number; // event id
  readonly canvasObjectId: number; // canvas object id attached with this event
  readonly command: CommandType;
  readonly snapShotBefore: any;
  readonly snapShotAfter: any;
}
