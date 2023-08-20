import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { fabric } from 'fabric';
import * as Rx from 'rxjs';
import { Socket } from 'socket.io-client';
import { Datastore } from 'src/app/Datastore/datastore';
import { Margin } from '../Directives/Margin';
import { DrawBoardSocketService } from '../Services/BackendServices/DrawBoardSignalRService';
import { DrawingMode, DrawingService } from '../Services/DrawerService';
import { InteractService } from '../Services/InteractService';
import { RedoUndoService } from '../Services/RedoUndoService/redoUndoService';
import { EventObject } from '../Services/RedoUndoService/types';

@Component({
  template: `
    <my-container class="Container">
      <my-grid class="Container-firstRowTools">
        <my-col [col]="6">
          <drawBoardPage-tools
            [ObjectWeight]="selectedObjectWidth$"
            (selectLine)="setLineHandler($event)"
            (selectCurve)="setCurveHandler($event)"
            (selectRectangle)="setRectangleHandler($event)"
            (selectCircle)="setCircleHandler($event)"
            (selectTriangle)="setTriangleHandler($event)"
            (selectMultiSelect)="setMultiSelectHandler($event)"
            (selectWeightSelect)="setWeightHandler($event)"
          ></drawBoardPage-tools>
        </my-col>
        <my-col [col]="4">
          <drawBoardPage-controls></drawBoardPage-controls>
        </my-col>
        <my-col [col]="2">
          <drawBoardPage-userPanel></drawBoardPage-userPanel>
        </my-col>
      </my-grid>
      <drawBoardPage-colorPlatte
        [ObjectColor]="selectedObjectColor$"
        (selectedColor)="setColorHandler($event)"
      ></drawBoardPage-colorPlatte>
      <my-container class="MyCanvas">
        <canvas width="900" height="700" id="fabricSurface"></canvas>
      </my-container>
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawBoardPageComponent implements OnInit, OnDestroy {
  Margin = Margin;

  selectedElement: any;

  start: number[] = [0, 0];
  end: number[] = [900, 900];

  // Value from interact service, the current selected object's color & weight
  selectedObjectColor$ = new Rx.Subject<string>();
  selectedObjectWidth$ = new Rx.Subject<number>();

  // Value from user interaction with widget, the user set color & weight
  emittedSelectedColor$ = new Rx.Subject<string>();
  emittedSelectedWidth$ = new Rx.Subject<number>();

  // The emitted event result from RedoUndoService when redo/undo button is clicked
  emittedUndoEventObject$ = new Rx.Subject<EventObject[]>();
  emittedRedoEventObject$ = new Rx.Subject<EventObject[]>();

  // Have avaliable redo undo actions.
  isRedoable$ = new Rx.Subject<boolean>();
  isUndoable$ = new Rx.Subject<boolean>();

  // When change customized properties for object, the getActiveObjects need to be refreshed
  // to reflect the new value. This makes sure the redo/undo on property change will separate step
  // by step.
  forceInteractiveServiceGetActiveObjects$ = new Rx.Subject<boolean>();
  haveActiveObject$ = new Rx.Subject<boolean>();

  subscription$ = new Rx.Subscription();

  private _canvas: fabric.Canvas;
  private isSelectLastAction: boolean = false;
  private _drawService: DrawingService;
  private _interactService: InteractService;
  private _redoUndoService: RedoUndoService;

  private socketio: Socket;
  constructor(
    private _drawBoardSocketService: DrawBoardSocketService,
    private dataStore: Datastore,
    private store: Store<any>
  ) {}

  ngOnInit() {
    // Getting the websocket connected

    this._canvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#ebebef',
      selection: false,
      preserveObjectStacking: true,
      targetFindTolerance: 10, // seelcting target allow 10 pixel tolerance value when selecting
      perPixelTargetFind: true, //when selecting using the actual object instead of the whole bounding box
    });
    this._canvas.selection = true; //group selection

    //Getting event from canvas to redoUndoService
    this._redoUndoService = new RedoUndoService(
      this.emittedUndoEventObject$,
      this.emittedRedoEventObject$,
      this.isRedoable$,
      this.isUndoable$,
      this._drawBoardSocketService,
      this.dataStore
    );

    // Set the drawing service for drawing object and change object property
    this._drawService = new DrawingService(
      this._canvas,
      this._redoUndoService,
      this.emittedUndoEventObject$,
      this.emittedRedoEventObject$,
      this._drawBoardSocketService.drawEventsObservable$,
      this.store
    );

    //Gettting the selected object color
    this._interactService = new InteractService(
      this._canvas,
      this.selectedObjectColor$,
      this.selectedObjectWidth$,
      this.haveActiveObject$,
      this.forceInteractiveServiceGetActiveObjects$,
      this._redoUndoService
    );

    // Set the draw color to the merge result of selecton and set
    this.subscription$.add(
      Rx.merge(this.selectedObjectColor$, this.emittedSelectedColor$).subscribe(
        (drawingColor) => {
          this._drawService.setDrawingColor(drawingColor);
        }
      )
    );

    // Set the draw width to the merge result of selecton and set
    this.subscription$.add(
      Rx.merge(this.selectedObjectWidth$, this.emittedSelectedWidth$).subscribe(
        (drawingWidth) => {
          this._drawService.setDrawingWeight(drawingWidth);
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }

  setLineHandler($event: any) {
    if (this.isSelectLastAction) {
      this.isSelectLastAction = false;
      this._drawService.makeObjectsNoneSeletable();
    }
    this._drawService.setDrawingTool(DrawingMode.Line);
  }

  //start free drawing
  setCurveHandler($event: any) {
    if (this.isSelectLastAction) {
      this.isSelectLastAction = false;
      this._drawService.makeObjectsNoneSeletable();
    }
    this._drawService.setDrawingTool(DrawingMode.FreeDraw);
  }

  setRectangleHandler($event: any) {
    if (this.isSelectLastAction) {
      this.isSelectLastAction = false;
      this._drawService.makeObjectsNoneSeletable();
    }
    this._drawService.setDrawingTool(DrawingMode.Rectangle);
  }

  setCircleHandler($event: any) {
    if (this.isSelectLastAction) {
      this.isSelectLastAction = false;
      this._drawService.makeObjectsNoneSeletable();
    }
    this._drawService.setDrawingTool(DrawingMode.Circle);
  }

  setTriangleHandler($event: any) {}

  //The drawer color should not only determined by the color-platte,
  // but also determined by current color selection, which should be
  // handled the same with color platte current showed color. The best
  // solution is to introduce two-way binding on color-platte component
  setColorHandler($event: string) {
    this.emittedSelectedColor$.next($event);
    this.forceInteractiveServiceGetActiveObjects$.next(true);
  }

  setWeightHandler($event: number) {
    this._drawService.setDrawingWeight($event);
    this.forceInteractiveServiceGetActiveObjects$.next(true);
  }

  //iterating all canvas objects, make all of them selectable
  setMultiSelectHandler($event: any) {
    this.isSelectLastAction = true;
    this._drawService.makeObjectsSeletable();
  }
}
