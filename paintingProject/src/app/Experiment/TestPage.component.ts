import { Component, OnInit } from '@angular/core';
import { fabric } from 'fabric';
import { DrawingEditor } from './Services/drawerService';
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
    <button (click)="onAddLine()">Add Line</button>
    <button (click)="onSelect()">Select</button>
    <button (click)="onAddUnselectableCircle()">Add Unselectable Circle</button>

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
    this._drawEditor.setDrawingTool(DrawingMode.Rectangle);
  }

  onAddCircle() {
    this._drawEditor.setDrawingTool(DrawingMode.Circle);
  }

  onAddLine() {
    this._drawEditor.setDrawingTool(DrawingMode.Line);
  }

  //iterating all canvas objects, make all of them selectable
  onSelect() {
    console.log('get all objects:');
    this._drawEditor.makeObjectsSeletable();
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
}
