import {
  Component,
  EventEmitter,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import {
  HorizontalAlignment,
  VerticalAlignment,
} from 'src/app/ComponentLibrary/MyGrid';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { BarColor } from 'src/app/ComponentLibrary/MyVerticalBar/myVerticalBar.component';
import { Margin } from 'src/app/Directives/Margin/margin.directive';

@Component({
  selector: 'Exp-tools',
  template: `
    <my-container [myHideMobile]="true" class="Tools">
      <my-grid
        [hAlign]="HorizontalAlignment.HORIZONTAL_CENTER"
        [vAlign]="VerticalAlignment.VERTICAL_CENTER"
      >
        <my-col class="logo" [col]="2">
          <my-button>Mass Art</my-button>
        </my-col>
        <my-vertical-bar
          [height]="5"
          [color]="BarColor.LIGHT"
          [myMarginRight]="Margin.XSMALL"
        ></my-vertical-bar>
        <my-col [col]="6">
          <my-grid>
            <my-col [col]="2">
              <my-button (click)="selectLineHandler()">
                <img class="Icons" src="./assets/line.svg" />
              </my-button>
            </my-col>
            <my-col [col]="2">
              <my-button (click)="selectCurveHandler()">
                <img class="Icons" src="./assets/curve.svg" />
              </my-button>
            </my-col>
            <my-col [col]="2">
              <my-button (click)="selectRectHandler()">
                <i class="bi bi-square"></i>
              </my-button>
            </my-col>
            <my-col [col]="2">
              <my-button (click)="selectCircleHandler()">
                <i class="bi bi-circle"></i>
              </my-button>
            </my-col>
            <my-col [col]="2">
              <my-button (click)="selectTriangleHandler()">
                <i class="bi bi-triangle"></i>
              </my-button>
            </my-col>
            <my-vertical-bar
              [height]="5"
              [color]="BarColor.LIGHT"
              [myMarginLeft]="Margin.XSMALL"
            ></my-vertical-bar>
          </my-grid>
        </my-col>
        <my-col [col]="3">
          <my-grid>
            <my-col [col]="4">
              <my-button (click)="selectMultiSelectHandler()">
                <i class="bi bi-app-indicator"></i>
              </my-button>
            </my-col>
            <my-col [col]="4">
              <my-button (click)="selectWeightHandler()">
                <i class="bi bi-border-width"></i>
              </my-button>
            </my-col>
            <my-col [col]="4">
              <my-button (click)="selectFillHandler()">
                <i class="bi bi-paint-bucket"></i>
              </my-button>
            </my-col>
          </my-grid>
        </my-col>
      </my-grid>
    </my-container>

    <my-container class="Tools" [myShowMobile]="true">
      <my-button>Mass</my-button>
      <my-horizontal-bar
        [width]="5"
        [color]="BarColor.LIGHT"
        [myMarginLeft]="Margin.SMALL"
      ></my-horizontal-bar>
      <my-button (click)="selectLineHandler()">
        <img class="Icons" src="./assets/line.svg" />
      </my-button>

      <my-button (click)="selectCurveHandler()">
        <img class="Icons" src="./assets/curve.svg" />
      </my-button>

      <my-button (click)="selectRectHandler()">
        <i class="bi bi-square"></i>
      </my-button>

      <my-button (click)="selectCircleHandler()">
        <i class="bi bi-circle"></i>
      </my-button>

      <my-button (click)="selectTriangleHandler()">
        <i class="bi bi-triangle"></i>
      </my-button>
      <my-horizontal-bar
        [myMarginLeft]="Margin.SMALL"
        [width]="5"
        [color]="BarColor.LIGHT"
      ></my-horizontal-bar>

      <my-button (click)="selectMultiSelectHandler()">
        <i class="bi bi-app-indicator"></i>
      </my-button>
      <my-button (click)="selectWeightHandler()">
        <i class="bi bi-border-width"></i>
      </my-button>

      <my-button (click)="selectFillHandler()">
        <i class="bi bi-paint-bucket"></i>
      </my-button>
    </my-container>
    <ng-container *ngIf="showWeightPicker">
      <Exp-weightPicker
        [maxWeight]="20"
        (selectedWeight)="setWeightHandler($event)"
      ></Exp-weightPicker>
    </ng-container>
  `,
  styleUrls: ['./Exp-tools.scss'],
})
export class ExpToolsComponent implements OnInit, OnChanges {
  HeadingType = HeadingType;
  HorizontalAlignment = HorizontalAlignment;
  VerticalAlignment = VerticalAlignment;
  BarColor = BarColor;
  Margin = Margin;
  showWeightPicker: boolean = false;

  @Output() selectLine: EventEmitter<any> = new EventEmitter();
  @Output() selectCurve: EventEmitter<any> = new EventEmitter();
  @Output() selectRectangle: EventEmitter<any> = new EventEmitter();
  @Output() selectCircle: EventEmitter<any> = new EventEmitter();
  @Output() selectCurveTriangle: EventEmitter<any> = new EventEmitter();
  @Output() selectMultiSelect: EventEmitter<any> = new EventEmitter();
  @Output() selectWeightSelect: EventEmitter<any> = new EventEmitter();

  ngOnInit() {}

  ngOnChanges() {}

  selectLineHandler() {
    console.log('selecting the line');
    this.selectLine.emit(true);
  }

  selectCurveHandler() {
    this.selectCurve.emit(true);
    console.log('selecting the curve');
  }

  selectRectHandler() {
    console.log('selecting the rect');
    this.selectRectangle.emit(true);
  }

  selectCircleHandler() {
    console.log('selecting the circle');
    this.selectCircle.emit(true);
  }

  selectTriangleHandler() {
    console.log('selecting the triangle');
  }

  selectMultiSelectHandler() {
    console.log('selecting the multiple selection');
    this.selectMultiSelect.emit(true);
  }

  selectWeightHandler() {
    console.log('selecting the weight');
    this.showWeightPicker = true;
  }

  setWeightHandler($event: any) {
    this.selectWeightSelect.emit($event);
  }

  selectFillHandler() {
    console.log('selecting the fill');
  }
}
