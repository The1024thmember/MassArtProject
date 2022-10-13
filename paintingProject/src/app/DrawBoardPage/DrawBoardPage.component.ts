import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
} from '@angular/core';
import { fabric } from 'fabric';
import { Margin } from '../Directives/Margin';

@Component({
  template: `
    <my-container class="Container">
      <my-grid class="Container-firstRowTools">
        <my-col [col]="5">
          <drawBoardPage-tools
            (selectLine)="selectLineHandler($event)"
            (selectCurve)="selectCurveHandler($event)"
            (selectRectangle)="selectRectangleHandler($event)"
            (selectCircle)="selectCircleHandler($event)"
            (selectTriangle)="selectTriangleHandler($event)"
          ></drawBoardPage-tools>
        </my-col>
        <my-col [col]="5">
          <drawBoardPage-controls></drawBoardPage-controls>
        </my-col>
        <my-col [col]="2">
          <drawBoardPage-userPanel></drawBoardPage-userPanel>
        </my-col>
      </my-grid>
      <drawBoardPage-colorPlatte></drawBoardPage-colorPlatte>

      <my-container class="MyCanvas">
        <canvas id="fabricSurface"></canvas>
      </my-container>
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawBoardPageComponent implements OnInit, OnChanges {
  Margin = Margin;
  private _canvas: fabric.Canvas;
  start: number[] = [0, 0];
  end: number[] = [200, 200];

  constructor() {}

  ngOnInit() {
    console.log('on init ...');
    this._canvas = new fabric.Canvas('fabricSurface', {
      selection: false,
      preserveObjectStacking: true,
    });
    this._canvas.selection = true; //group selection
  }

  ngOnChanges() {
    console.log('something changed ...');
  }

  selectLineHandler($event: any) {
    console.log('drawing line on the canvas');
    this.onAddLine();
  }
  selectCurveHandler($event: any) {}
  selectRectangleHandler($event: any) {}
  selectCircleHandler($event: any) {}
  selectTriangleHandler($event: any) {}

  onAddLine() {
    //points [ x1,y1, x2,y2]
    var line = new fabric.Line([...this.start, ...this.end], {
      stroke: 'red',
    });
    console.log(`drawing: from:${this.start} to ${this.end}`);
    // "add" line onto canvas
    this._canvas.add(line);
  }

  onAddRect() {
    var rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'red',
      width: 20,
      height: 20,
    });

    // "add" rectangle onto canvas
    this._canvas.add(rect);
  }

  onAddCircle() {
    var circle = new fabric.Circle({
      radius: 20,
      fill: 'green',
      left: 100,
      top: 100,
    });

    // "add" rectangle onto canvas
    this._canvas.add(circle);
  }

  onAddUnselectableCircle() {
    var circle = new fabric.Circle({
      radius: 20,
      fill: 'green',
      left: 100,
      top: 100,
      selectable: false,
    });

    // "add" rectangle onto canvas
    this._canvas.add(circle);
  }
}
