import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { fabric } from 'fabric';
import * as Rx from 'rxjs';
import { Margin } from '../Directives/Margin';
import { DrawingEditor, DrawingMode } from '../Services/DrawerService';
import { InteractService } from '../Services/InteractService';

@Component({
  template: `
    <my-container class="Container">
      <my-grid class="Container-firstRowTools">
        <my-col [col]="6">
          <drawBoardPage-tools
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

  subscription$ = new Rx.Subscription();

  private _canvas: fabric.Canvas;
  private isSelectLastAction: boolean = false;
  private _drawEditor: DrawingEditor;
  private _interactService: InteractService;

  constructor() {}

  ngOnInit() {
    this._canvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#ebebef',
      selection: false,
      preserveObjectStacking: true,
      targetFindTolerance: 10, // seelcting target allow 10 pixel tolerance value when selecting
      perPixelTargetFind: true, //when selecting using the actual object instead of the whole bounding box
    });
    this._canvas.selection = true; //group selection
    this._drawEditor = new DrawingEditor(this._canvas);

    //Gettting the selected object color
    this._interactService = new InteractService(
      this._canvas,
      this.selectedObjectColor$,
      this.selectedObjectWidth$
    );

    // Set the draw color to the merge result of selecton and set
    this.subscription$.add(
      Rx.merge(this.selectedObjectColor$, this.emittedSelectedColor$).subscribe(
        (drawingColor) => {
          this._drawEditor.setDrawingColor(drawingColor);
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
      this._drawEditor.makeObjectsNoneSeletable();
    }
    this._drawEditor.setDrawingTool(DrawingMode.Line);
  }

  //start free drawing
  setCurveHandler($event: any) {
    if (this.isSelectLastAction) {
      this.isSelectLastAction = false;
      this._drawEditor.makeObjectsNoneSeletable();
    }
    this._drawEditor.setDrawingTool(DrawingMode.FreeDraw);
  }

  setRectangleHandler($event: any) {
    if (this.isSelectLastAction) {
      this.isSelectLastAction = false;
      this._drawEditor.makeObjectsNoneSeletable();
    }
    this._drawEditor.setDrawingTool(DrawingMode.Rectangle);
  }

  setCircleHandler($event: any) {
    if (this.isSelectLastAction) {
      this.isSelectLastAction = false;
      this._drawEditor.makeObjectsNoneSeletable();
    }
    this._drawEditor.setDrawingTool(DrawingMode.Circle);
  }

  setTriangleHandler($event: any) {}

  //The drawer color should not only determined by the color-platte,
  // but also determined by current color selection, which should be
  // handled the same with color platte current showed color. The best
  // solution is to introduce two-way binding on color-platte component
  setColorHandler($event: string) {
    this.emittedSelectedColor$.next($event);
  }

  setWeightHandler($event: number) {
    this._drawEditor.setDrawingWeight($event);
  }

  //iterating all canvas objects, make all of them selectable
  setMultiSelectHandler($event: any) {
    this.isSelectLastAction = true;
    this._drawEditor.makeObjectsSeletable();
  }
}
