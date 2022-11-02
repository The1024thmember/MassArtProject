import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
} from '@angular/core';
import { fabric } from 'fabric';
import { Margin } from '../Directives/Margin';
import { DrawingEditor, DrawingMode } from '../Services/DrawerService';

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

  private _canvas: fabric.Canvas;
  private _drawEditor: DrawingEditor;
  private isSelectLastAction: boolean = false;

  selectedElement: any;
  color: string = '#000';
  start: number[] = [0, 0];
  end: number[] = [900, 900];

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
    this.color = $event;
    this._drawEditor.setDrawingColor(this.color);
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
