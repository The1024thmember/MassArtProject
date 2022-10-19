import { Component, OnInit } from '@angular/core';
import { fabric } from 'fabric';
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
    <button (click)="onSetUnselectableCirclePosition()">
      Set Unselectable Circle Position
    </button>
  </my-container>`,
})
export class TestPageComponent implements OnInit {
  private _canvas: fabric.Canvas;
  canvasElement: HTMLElement | null;
  //private _mouseUp: (evt: fabric.IEvent) => void;

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

  //change the position for the last added element
  onSetUnselectableCirclePosition() {
    const obj = this._canvas.getObjects()[this._canvas.getObjects().length - 1];
    document.addEventListener(
      'mousemove',
      () => {
        this.functionYouWantToCall(event, obj);
      },
      false
    );
    console.log('clicked onSetUnselectableCirclePosition');
  }

  functionYouWantToCall(event: any, obj: any) {
    obj.set({
      left: event.pageX,
      top: event.pageY,
    });
    obj.setCoords();
    console.log(obj);
    this._canvas.renderAll();
  }
}
