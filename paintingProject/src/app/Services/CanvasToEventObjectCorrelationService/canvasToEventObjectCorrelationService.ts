import { EventObject } from '../RedoUndoService/types';
/*
  Generate correlation Id between canvas object and event object
  and return the corresponding canvas object if correlationId is
  provided
*/
export class CanvasToEventObjectCorrelationService {
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
