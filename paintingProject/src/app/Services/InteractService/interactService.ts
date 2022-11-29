import * as Rx from 'rxjs';
import { RedoUndoService } from '../RedoUndoService/redoUndoService';
/*
  All the functionality within this service is exectuable when it is in selection mode
  The function for this service is to: excute read operation on object
  1. Read the property of the objects in the canvas and reflect them in tools via selectedObjectColor and selectedObjectWidth

  // input for the service: canvas, selectedObjectColor, selectedObjectWidth
*/
export class InteractService {
  canvas: fabric.Canvas;
  selectedObjectColor$: Rx.Subject<string>;
  selectedObjectWidth$: Rx.Subject<number>;
  _redoUndoService: RedoUndoService;

  private currentSelectObject: fabric.Object | null;
  private activeObjects: fabric.Object[];

  constructor(
    canvas: fabric.Canvas,
    selectedObjectColor$: Rx.Subject<string>,
    selectedObjectWidth$: Rx.Subject<number>,
    _redoUndoService: RedoUndoService
  ) {
    //Create the Fabric canvas
    this.canvas = canvas;
    this.selectedObjectColor$ = selectedObjectColor$;
    this.selectedObjectWidth$ = selectedObjectWidth$;
    this._redoUndoService = _redoUndoService;

    //Create event listener on canvas
    this.initializeCanvasEvents();
  }

  private initializeCanvasEvents() {
    /*  Will be trigger via:
    1) create new object, the new object will be selected
    2) when currently there is no selection, selected something
    */
    this.canvas.on('selection:created', (o) => {
      // after creating, it is selected by default
      // the current found way to distinguish between creation select and
      // select via the selection mode and click on the object is the mouse event
      if (o.e) {
        this.getCurrentActiveObjects();
        if (this.isSingleSelected()) {
          this.selectedObjectColor$.next(this.getSelectedObjectColor());
          this.selectedObjectWidth$.next(this.getSelectedObjectWeight());
        }
      }
    });

    /*  Will be trigger via:
        1) change selection from A object to B object
    */
    this.canvas.on('selection:updated', (o) => {
      // change selection
      this.getCurrentActiveObjects();
      if (this.isSingleSelected()) {
        this.selectedObjectColor$.next(this.getSelectedObjectColor());
        this.selectedObjectWidth$.next(this.getSelectedObjectWeight());
      }
    });

    /*  Will be trigger via:
        1) When previous has some selected object, then remove them by click on
            elsewhere in the canvas
    */
    this.canvas.on('selection:cleared', (o) => {
      // mouse click on empty canvas, so no object is selected
    });

    this.canvas.on('object:scaling', (e) => {
      var o = e.target;
      // how to make object on scale strokeWidth not change
      // TODO: https://app.clickup.com/t/3ak2xtp
    });

    this.canvas.on('object:modified', (e) => {
      var o = e.target;
      // how to make object on scale strokeWidth not change
      // TODO: https://app.clickup.com/t/3ak2xtp
    });
  }

  private getCurrentActiveObjects() {
    this.activeObjects = this.canvas.getActiveObjects();
    if (this.activeObjects.length === 1) {
      this.currentSelectObject = this.activeObjects[0];
    } else {
      this.currentSelectObject = null;
    }
  }

  private getSelectedObjectColor(): string {
    if (!this.currentSelectObject) {
      // means there are multiple objects selected
      return 'black';
    } else {
      return this.currentSelectObject?.stroke || 'black';
    }
  }

  private getSelectedObjectWeight(): number {
    if (!this.currentSelectObject) {
      // means there are multiple objects selected
      return 2;
    } else {
      return this.currentSelectObject?.strokeWidth || 2;
    }
  }

  //Won't change the weight and color, keep as default
  private isMultipleSelected() {
    if (this.activeObjects.length > 1) {
      return true;
    }
    return false;
  }

  //Will change the weight and color based on current selection
  private isSingleSelected() {
    if (this.activeObjects.length == 1) {
      return true;
    }
    return false;
  }
}
