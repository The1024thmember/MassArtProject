import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
} from '@angular/core';
import { fabric } from 'fabric';
import { Margin } from '../Directives/Margin';
import { CanvasDragAndDropService } from '../Services/CanvasDragAndDrop/canvasDragAndDrop.service';

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
export class DrawBoardPageComponent implements OnInit, OnChanges {
  Margin = Margin;
  private _canvas: fabric.Canvas;
  color: string = '#000';
  start: number[] = [0, 0];
  end: number[] = [900, 900];

  constructor(private canvasDragAndDropService: CanvasDragAndDropService) {}

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

  setLineHandler($event: any) {
    console.log('drawing line on the canvas');
    this.onAddLine();
  }

  setColorHandler($event: string) {
    console.log('setting color for current draw');
    this.color = $event;
  }

  setCurveHandler($event: any) {}
  setRectangleHandler($event: any) {}
  setCircleHandler($event: any) {}
  setTriangleHandler($event: any) {}

  getPosition() {
    //points [ x1,y1, x2,y2]

    this._canvas.on(
      'mouse:down',
      (e) => (this.start = this.canvasDragAndDropService.getStartPosition(e))
    );

    this._canvas.on(
      'mouse:up',
      (e) => (this.end = this.canvasDragAndDropService.getEndPosition(e))
    );
  }

  onAddLine() {
    this.getPosition();

    var line = new fabric.Line([...this.start, ...this.end], {
      stroke: this.color,
    });
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
