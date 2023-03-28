import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { fabric } from 'fabric';
import * as Rx from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { Margin } from '../Directives/Margin';
import { DrawEventSocketService } from '../Services/BackendServices/drawEventPullingService';
import { CursorMode, DrawingMode, ToolsType } from '../Services/DrawerService';
import { DrawingService } from '../Services/DrawerService/drawerService';
import { InteractService } from '../Services/InteractService';
import { RedoUndoService } from '../Services/RedoUndoService/redoUndoService';
import { EventObject } from '../Services/RedoUndoService/types';

@Component({
  template: `
    <my-container class="Container">
      <my-container
        class="Container-canvasContainer"
        contenteditable="true"
        (keydown)="onCanvasKeydown($event)"
        (keydown.control.z)="undoClickedHandler($event)"
        (keydown.control.y)="redoClickedHandler($event)"
        (keydown.control.c)="copyHandler($event)"
        (keydown.control.v)="pasteHandler($event)"
        (click)="onCavansClick()"
      >
        <canvas
          class="Container-canvasContainer-canvas"
          width="2000"
          height="1100"
          id="fabricSurface"
        ></canvas>
      </my-container>
      <my-grid class="Container-firstRowTools">
        <my-col [col]="6">
          <Exp-tools
            [haveActiveObject]="haveActiveObject$"
            [ObjectWeight]="selectedObjectWidth$"
            [focusOnCanvas]="focusOnCanvas$"
            [toolIndicator]="toolIndicator$"
            (selectLine)="setLineHandler($event)"
            (selectCurve)="setCurveHandler($event)"
            (selectRectangle)="setRectangleHandler($event)"
            (selectCircle)="setCircleHandler($event)"
            (selectTriangle)="setTriangleHandler($event)"
            (selectMultiSelect)="setMultiSelectHandler($event)"
            (selectWeightSelect)="setWeightHandler($event)"
            (selectDelete)="deleteSelectedObject($event)"
          ></Exp-tools>
        </my-col>
        <my-col [col]="4">
          <Exp-controls
            [isRedoable]="isRedoable$"
            [isUndoable]="isUndoable$"
            (undoClicked)="undoClickedHandler($event)"
            (redoClicked)="redoClickedHandler($event)"
          ></Exp-controls>
        </my-col>
        <my-col [col]="2">
          <Exp-userPanel></Exp-userPanel>
        </my-col>
      </my-grid>
      <Exp-colorPlatte
        class="Container-colorPlatte"
        [ObjectColor]="selectedObjectColor$"
        [focusOnCanvas]="focusOnCanvas$"
        (selectedColor)="setColorHandler($event)"
      ></Exp-colorPlatte>
    </my-container>
  `,
  styleUrls: ['./Exp.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpComponent implements OnInit, OnDestroy {
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

  // Indicate the drawing mode and tools selected
  toolIndicator$ = new Rx.Subject<ToolsType>();

  // Indicate if is currently focus on the canvas
  focusOnCanvas$ = new Rx.Subject<boolean>();

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
  constructor(private socket: DrawEventSocketService) {}

  ngOnInit() {
    // Getting the websocket connected
    this.socketio = io('http://127.0.0.1:5000/exp');
    this.socket.iniServerSocket();

    this.socketio.on('connect', () => {
      console.log('DrawEvent Connected');
    });

    this.socketio.on('disconnect', () => {
      console.log('DrawEvent Disconnected');
    });

    this._canvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#ebebef',
      selection: false,
      preserveObjectStacking: true,
      targetFindTolerance: 10, // seelcting target allow 10 pixel tolerance value when selecting
      perPixelTargetFind: true, //when selecting using the actual object instead of the whole bounding box
      centeredScaling: true,
      centeredRotation: true,
    });
    this._canvas.selection = true; //group selection

    //Getting event from canvas to redoUndoService
    this._redoUndoService = new RedoUndoService(
      this.emittedUndoEventObject$,
      this.emittedRedoEventObject$,
      this.isRedoable$,
      this.isUndoable$
    );

    // Set the drawing service for drawing object and change object property
    this._drawService = new DrawingService(
      this._canvas,
      this._redoUndoService,
      this.emittedUndoEventObject$,
      this.emittedRedoEventObject$,
      this.socket,
      this.socketio
    );

    //Getting the selected object color
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
    this.switchToNonSelectMode();
    this.toolIndicator$.next(ToolsType.Line);
    this._drawService.setDrawingTool(DrawingMode.Line);
  }

  //start free drawing
  setCurveHandler($event: any) {
    this.switchToNonSelectMode();
    this.toolIndicator$.next(ToolsType.FreeDraw);
    this._drawService.setDrawingTool(DrawingMode.FreeDraw);
  }

  setRectangleHandler($event: any) {
    this.switchToNonSelectMode();
    this.toolIndicator$.next(ToolsType.Rectangle);
    this._drawService.setDrawingTool(DrawingMode.Rectangle);
  }

  setCircleHandler($event: any) {
    this.switchToNonSelectMode();
    this.toolIndicator$.next(ToolsType.Circle);
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
    this.emittedSelectedWidth$.next($event);
    this.forceInteractiveServiceGetActiveObjects$.next(true);
  }

  deleteSelectedObject($event: boolean) {
    this._drawService.handleDeletion();
  }

  //iterating all canvas objects, make all of them selectable
  setMultiSelectHandler($event: any) {
    this.isSelectLastAction = true;
    this.toolIndicator$.next(ToolsType.Select);
    this._drawService.makeObjectsSeletable();
  }

  undoClickedHandler($event: any) {
    this._redoUndoService.undo();
  }

  redoClickedHandler($event: any) {
    this._redoUndoService.redo();
  }

  copyHandler($event: any) {
    this._drawService.handleKeyDown({ key: 'Copy' });
  }

  pasteHandler($event: any) {
    this._drawService.handleKeyDown({ key: 'Paste' });
  }

  switchToNonSelectMode() {
    if (this.isSelectLastAction) {
      this.isSelectLastAction = false;
      this._drawService.makeObjectsNoneSeletable();
    }
  }

  // For deletion at the moment
  onCanvasKeydown($event: any) {
    this._drawService.handleKeyDown($event);
  }

  // Hide the color platte and weight picker
  onCavansClick() {
    if (this._drawService.getCursorMode() === CursorMode.Draw) {
      this.focusOnCanvas$.next(true);
    }
  }

  sendNews(message: string) {
    this.socketio.emit('news', message);
    console.log('emit news');
  }

  sendMessage() {
    this.socketio.send(Math.random().toString());
    console.log('send Message');
  }
}
