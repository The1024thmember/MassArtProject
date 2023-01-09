import * as Rx from 'rxjs';
import { RedoUndoService } from '../RedoUndoService/redoUndoService';
import { EventObject } from '../RedoUndoService/types';
/*
  All the functionality within this service is exectuable when it is in selection mode
  The function for this service is to: excute read operation on object
  1. Read the property of the objects in the canvas and reflect them in tools via selectedObjectColor and selectedObjectWidth

  // input for the service: canvas, selectedObjectColor, selectedObjectWidth
*/
export class InteractService {
  canvas: fabric.Canvas;
  // This service emits the selected object color & weight
  selectedObjectColor$: Rx.Subject<string>;
  selectedObjectWidth$: Rx.Subject<number>;
  // Forces the activeObject have the updated property when color or weight changes
  haveActiveObject$: Rx.Subject<boolean>;
  forceInteractiveServiceGetActiveObjects$: Rx.Subject<boolean>;
  _redoUndoService: RedoUndoService;

  private currentSelectObject: fabric.Object | null;
  private activeObjects: fabric.Object[];
  private activeObjectsOriginal: { [key: number]: fabric.Object } = {};

  constructor(
    canvas: fabric.Canvas,
    selectedObjectColor$: Rx.Subject<string>,
    selectedObjectWidth$: Rx.Subject<number>,
    haveActiveObject$: Rx.Subject<boolean>,
    forceInteractiveServiceGetActiveObjects$: Rx.Subject<boolean>,
    _redoUndoService: RedoUndoService
  ) {
    //Create the Fabric canvas
    this.canvas = canvas;
    this.selectedObjectColor$ = selectedObjectColor$;
    this.selectedObjectWidth$ = selectedObjectWidth$;
    this.haveActiveObject$ = haveActiveObject$;
    this.forceInteractiveServiceGetActiveObjects$ =
      forceInteractiveServiceGetActiveObjects$;
    this._redoUndoService = _redoUndoService;

    //Create event listener on canvas
    this.initializeCanvasEvents();
  }

  private initializeCanvasEvents() {
    /*
      Will be triggered by change weight or color, aims to make get the updated property
      on active objects
    */
    this.forceInteractiveServiceGetActiveObjects$.subscribe(() => {
      this.getCurrentActiveObjects();
    });

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
      this.haveActiveObject$.next(false);
      // mouse click on empty canvas, so no object is selected
    });

    /* object:modified listener won't fire if it is color change or weight change
       change position, scale and rotating will trigger this. A bug for this is that
       if select an object, do move, scale up and rotate, then the undo stack before
       changes will always be the status of the object on selection.
    */
    this.canvas.on('object:modified', (e) => {
      var o = e.target;
      this.haveActiveObject$.next(true);
      // how to make object on scale strokeWidth not change
      // TODO: https://app.clickup.com/t/3ak2xtp
      const changePropertyEventsBatch: EventObject[] = [];

      Object.keys(this.activeObjectsOriginal).forEach((index) => {
        const indexAsNumber = parseInt(index);
        const updatedObj = this.canvas._objects[indexAsNumber];
        if (updatedObj.group) {
          updatedObj.group.centeredRotation = true;
        }
        const changePropertyEvent =
          this._redoUndoService.buildPropertyChangeEventObject(
            indexAsNumber + 1,
            this.activeObjectsOriginal[indexAsNumber],
            updatedObj,
            {}
          );
        changePropertyEventsBatch.push(changePropertyEvent);

        /* update the original snapshot before of an object once the object has been modified,
         so that multiple operation on the same object without reselection will be separatable
        */
        this.activeObjectsOriginal[indexAsNumber] = JSON.parse(
          JSON.stringify(updatedObj)
        );
        Object.assign(this.activeObjectsOriginal[indexAsNumber], {
          group: { ...updatedObj.group },
          canvas: updatedObj.canvas,
          ...updatedObj.getObjectScaling(),
        });
      });

      // Emit the events
      if (changePropertyEventsBatch.length) {
        this._redoUndoService.emitEvent(changePropertyEventsBatch);
      }
      // this where to send these event to backend
    });
  }

  private getCurrentActiveObjects() {
    this.activeObjects = this.canvas.getActiveObjects();
    this.haveActiveObject$.next(!!this.activeObjects.length);
    this.activeObjectsOriginal = {};
    this.activeObjects.forEach((obj) => {
      const index = this.canvas.getObjects().indexOf(obj);
      // Json.stringify will discard the functions, but in this case we need the functions
      // the activeObjectsOriginal is not accurate, especially after change the color or weight
      this.activeObjectsOriginal[index] = JSON.parse(JSON.stringify(obj));
      Object.assign(this.activeObjectsOriginal[index], {
        group: { ...obj.group, centeredRotation: true },
        canvas: obj.canvas,
        ...obj.getObjectScaling(),
      });
    });

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
