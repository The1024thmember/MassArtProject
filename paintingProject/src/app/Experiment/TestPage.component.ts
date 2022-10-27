import { Component, OnInit } from '@angular/core';
import { fabric } from 'fabric';
import { DrawingEditor } from './Services/drawer';
import { DrawingMode } from './Services/types';
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
    <button (click)="onMultiSelect()">Select / Multi Select</button>

    <!--
    <button (click)="drawline(this.selectedElement)">click to draw line</button>
    <button (click)="onSetUnselectableCirclePosition(this.selectedElement)">
      click to move object position
    </button>
    -->
  </my-container>`,
})
export class TestPageComponent implements OnInit {
  private _canvas: fabric.Canvas;
  private _drawEditor: DrawingEditor;
  canvasElement: HTMLElement | null;
  //private _mouseUp: (evt: fabric.IEvent) => void;
  private isDown: boolean = false;
  selectedElement: any;

  constructor() {
    //protected _fabricService: FabricService
    //this._mouseUp = (evt: fabric.IEvent) => this.__onMouseUp(evt);
    console.log('showing test component');
  }

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
    console.log(this._canvas);
    //this._fabricService.canvas = this._canvas;
    // this._canvas.on('mouse:up', this._mouseUp);

    this.canvasElement = document.getElementById('fabricSurface');
    //this.initilizeDrawer();
  }

  onAddRect() {
    console.log('get all objects:');
    console.log(this._canvas.getObjects());
    this._drawEditor.setDrawingTool(DrawingMode.Rectangle);
  }

  onAddCircle() {
    this._drawEditor.setDrawingTool(DrawingMode.Circle);
  }

  onAddLine() {
    this._drawEditor.setDrawingTool(DrawingMode.Line);
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

  onMultiSelect() {}

  /*
  initilizeDrawer() {
    var line: fabric.Line;
    this._canvas.on('mouse:down', (o) => {
      const e = <MouseEvent>o.e;
      this.isDown = true;
      console.log('key down');
      const pointer = this._canvas.getPointer(o.e);
      line = this.onAddLine(pointer.x, pointer.y, pointer.x, pointer.y);
    });

    this._canvas.on('mouse:move', (o) => {
      const e = <MouseEvent>o.e;
      if (this.isDown) {
        const pointer = this._canvas.getPointer(o.e);
        this.mouseMove(line, pointer.x, pointer.y);
      }
    });

    this._canvas.on('mouse:up', (o) => {
      this.isDown = false;
    });

    this._canvas.on('selection:created', (o) => {
      // after creating, it is selected by default
      console.log('Something is being selected');
    });

    this._canvas.on('selection:updated', (o) => {
      // change selection
      console.log('Something is being updated');
    });

    this._canvas.on('object:selected', (o) => {
      // not sure function yet
      console.log('object is being selected');
    });

    this._canvas.on('selection:cleared', (o) => {
      // mouse click on empty canvas, so no object is selected
      console.log('There is no object under selection');
    });
  }

  private async mouseMove(
    line: fabric.Line,
    x: number,
    y: number
  ): Promise<any> {
    if (this.isDown) {
      line
        .set({
          x2: x,
          y2: y,
        })
        .setCoords();
      //Renders all objects to the canvas
      this._canvas.renderAll();
    }
  }
  */

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
