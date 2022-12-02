import { EventObject } from '../RedoUndoService/types';
/*
  Generate correlation Id between canvas object and event object
  and return the corresponding canvas object if correlationId is
  provided
*/
export class CanvasToEventObjectCorrelationService {
  // Since for undo create event, the current implementation is use
  // ghost canvas object as placeholder, therefore some special property
  // is need to make the placeholder object as ghost object, its better
  // to live in this service as the implementation detail is part of the
  // service.
  public ghostObjectProperty = {
    strokeWidth: 0,
    selectable: false,
    strokeUniform: true,
    hasControls: false,
    hasBorders: false,
  };

  private objectCounter: number = 0;

  constructor() {}

  addNewObject() {
    this.objectCounter += 1;
  }

  getEventObjectCorrelationId(): number {
    return this.objectCounter;
  }

  getTotalObjectNumber() {
    return this.objectCounter;
  }

  // This function need to be changed if the way how correlactionId is generated changes
  getCanvasObjectLocation(eventObject: EventObject): number {
    return eventObject.canvasObjectId - 1;
  }
}
