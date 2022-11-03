import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
} from '@angular/core';
import { fabric } from 'fabric';
import * as Rx from 'rxjs';
import { map } from 'rxjs';
import { Margin } from '../Directives/Margin';
import { DrawingEditor, DrawingMode } from '../Services/DrawerService';
import { InteractService } from '../Services/InteractService';

@Component({
  template: `
    <my-container class="Container">
      <my-grid class="Container-firstRowTools">
        <my-col [col]="6">
          <Exp-tools
            (selectLine)="setLineHandler($event)"
            (selectCurve)="setCurveHandler($event)"
            (selectRectangle)="setRectangleHandler($event)"
            (selectCircle)="setCircleHandler($event)"
            (selectTriangle)="setTriangleHandler($event)"
            (selectMultiSelect)="setMultiSelectHandler($event)"
            (selectWeightSelect)="setWeightHandler($event)"
          ></Exp-tools>
        </my-col>
        <my-col [col]="4">
          <Exp-controls></Exp-controls>
        </my-col>
        <my-col [col]="2">
          <Exp-userPanel></Exp-userPanel>
        </my-col>
      </my-grid>
      <Exp-colorPlatte
        [selectedObjectColor]="(color$ | myAsync) ?? 'black'"
        (selectedColor)="setColorHandler($event)"
      ></Exp-colorPlatte>
      <my-container class="MyCanvas">
        <canvas width="900" height="700" id="fabricSurface"></canvas>
      </my-container>
    </my-container>
  `,
  styleUrls: ['./Exp.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpComponent implements OnInit, OnChanges {
  Margin = Margin;

  selectedElement: any;

  start: number[] = [0, 0];
  end: number[] = [900, 900];

  color$ = new Rx.Observable<string>();
  selectedObjectColor$ = new Rx.Subject<string>();
  selectedObjectWidth$ = new Rx.Subject<number>();

  private _canvas: fabric.Canvas;
  private isSelectLastAction: boolean = false;
  private _drawEditor: DrawingEditor;
  private _interactService: InteractService;

  constructor() {}

  ngOnInit() {
    console.log('on init ...');
    this._canvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#ebebef',
      selection: false,
      preserveObjectStacking: true,
      targetFindTolerance: 10, // seelcting target allow 10 pixel tolerance value when selecting
      perPixelTargetFind: true, //when selecting using the actual object instead of the whole bounding box
    });
    this._canvas.selection = true; //group selection
    this._drawEditor = new DrawingEditor(this._canvas);
    this._interactService = new InteractService(
      this._canvas,
      this.selectedObjectColor$,
      this.selectedObjectWidth$
    );

    this.color$ = Rx.combineLatest([this.selectedObjectColor$]).pipe(
      map((selectedColor: any) => selectedColor ?? 'black'),
      Rx.tap((_) => console.log(_))
    );
  }

  ngOnChanges() {
    console.log('something changed ...');
  }

  setLineHandler($event: any) {
    console.log('drawing line on the canvas');
    if (this.isSelectLastAction) {
      this.isSelectLastAction = false;
      this._drawEditor.makeObjectsNoneSeletable();
    }
    this._drawEditor.setDrawingTool(DrawingMode.Line);
  }

  setCurveHandler($event: any) {}

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

  setColorHandler($event: string) {
    console.log('setting color for current draw');
    this._drawEditor.setDrawingColor($event);
  }

  setWeightHandler($event: number) {
    console.log('setting weight for current draw');
    this._drawEditor.setDrawingWeight($event);
  }

  //iterating all canvas objects, make all of them selectable
  setMultiSelectHandler($event: any) {
    console.log('get all objects:');
    this.isSelectLastAction = true;
    this._drawEditor.makeObjectsSeletable();
  }
}
