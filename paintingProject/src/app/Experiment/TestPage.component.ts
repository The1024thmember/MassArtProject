import { Component, OnInit } from '@angular/core';
import { fabric } from 'fabric';
import { DrawingEditor } from './drawer';
@Component({
  selector: 'test',
  template: `<my-container>
    <canvas
      width="1500"
      height="900"
      style="border: 1px solid #cccccc;"
      id="fabricSurface"
    ></canvas>

    <button (click)="onAddRect()">Add Rectangle</button>
    <button (click)="onAddCircle()">Add Circle</button>
    <button (click)="onAddUnselectableCircle()">Add Unselectable Circle</button>

    <button (click)="onAddLine()">Add Line</button>
    <button (click)="drawline(this.selectedElement)">click to draw line</button>
    <button (click)="onSetUnselectableCirclePosition(this.selectedElement)">
      click to move object position
    </button>
  </my-container>`,
})
export class TestPageComponent implements OnInit {
  private _canvas: fabric.Canvas;
  private _drawEditor: DrawingEditor;
  canvasElement: HTMLElement | null;
  //private _mouseUp: (evt: fabric.IEvent) => void;

  selectedElement: any;

  constructor() {
    //protected _fabricService: FabricService
    //this._mouseUp = (evt: fabric.IEvent) => this.__onMouseUp(evt);
    console.log('showing test component');
    this._drawEditor = new DrawingEditor('canvas', 1500, 800);
  }

  ngOnInit() {
    this._canvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#ebebef',
      selection: false,
      preserveObjectStacking: true,
    });
    this._canvas.selection = true; //group selection
    console.log(this._canvas);
    //this._fabricService.canvas = this._canvas;
    // this._canvas.on('mouse:up', this._mouseUp);

    this.canvasElement = document.getElementById('fabricSurface');
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
    this.selectedElement = rect;
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
    this.selectedElement = circle;
    this._canvas.add(circle);
  }

  onAddLine() {
    var line = new fabric.Line([0, 0, 0, 0], {
      stroke: 'black',
    });
    // "add" line onto canvas
    this.selectedElement = line;
    this._canvas.add(line);
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
    this.selectedElement = circle;
    this._canvas.add(circle);
  }

  //change the position for the last added element
  onSetUnselectableCirclePosition(param: any) {
    document.addEventListener(
      'mousemove',
      () => {
        this.functionYouWantToCall(event, param);
      },
      false
    );
    console.log('clicked onSetUnselectableCirclePosition');
  }

  // for change the latest selected object position
  functionYouWantToCall(event: any, obj: any) {
    obj.set({
      left: event.pageX,
      top: event.pageY,
    });
    obj.setCoords();
    console.log(obj);
    this._canvas.renderAll();
  }

  drawline(param: any) {
    document.addEventListener(
      'mousedown',
      () => this.getStartPosition(event, param),
      false
    );
    console.log('start draw line');
  }

  getStartPosition(event: any, param: any) {
    console.log('mouse down:');
    console.log(event);
    //const startPos = [event.pageX, event.pageY];
    const startPos = [event.pageX, event.pageY];
    document.addEventListener('mousemove', () => {
      this.dragLine(event, param, startPos);
    });
  }

  //for drag line
  dragLine(event: any, obj: any, startPos: number[]) {
    obj.set({
      left: startPos[0],
      top: startPos[1],
      width: event.pageX,
      height: event.pageY,
      stroke: 'red',
    });
    obj.setCoords();
    console.log(obj);
    console.log('canvas:', this._canvas);
    this._canvas.renderAll();
  }
}
