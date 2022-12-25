import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import * as Rx from 'rxjs';
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
        <my-col class="logo" [col]="1">
          <my-button>MA</my-button>
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
        <my-col [col]="4">
          <my-grid>
            <my-col [col]="3">
              <my-button (click)="selectMultiSelectHandler()">
                <i class="bi bi-app-indicator"></i>
              </my-button>
            </my-col>
            <my-col [col]="3">
              <my-button (click)="selectWeightHandler()">
                <i class="bi bi-border-width"></i>
              </my-button>
            </my-col>
            <my-col [col]="3">
              <my-button (click)="selectFillHandler()">
                <i class="bi bi-paint-bucket"></i>
              </my-button>
            </my-col>
            <my-col [col]="3">
              <my-button
                [disabled]="!(haveActiveObject | myAsync)"
                (click)="selectDeleteHandler()"
              >
                D
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

      <my-button
        [disabled]="!(haveActiveObject | myAsync)"
        (click)="selectDeleteHandler()"
      >
        D
      </my-button>
    </my-container>
    <ng-container *ngIf="showWeightPicker">
      <Exp-weightPicker
        [maxWeight]="50"
        [setWidthValueFromSelection]="
          (selectedWidthOrFromObject$ | myAsync) ?? currentWeight
        "
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

  currentWeight: number = 1;
  selectedWidthOrFromObject$ = new Rx.Observable<number>();
  currentWidthObservable$ = new Rx.Subject<number>();

  @Input() ObjectWeight: Rx.Observable<number>; // The selected object width
  @Input() haveActiveObject: Rx.Observable<boolean>; // Indicate if there is active object or not.

  @Output() selectLine: EventEmitter<any> = new EventEmitter();
  @Output() selectCurve: EventEmitter<any> = new EventEmitter();
  @Output() selectRectangle: EventEmitter<any> = new EventEmitter();
  @Output() selectCircle: EventEmitter<any> = new EventEmitter();
  @Output() selectCurveTriangle: EventEmitter<any> = new EventEmitter();
  @Output() selectMultiSelect: EventEmitter<any> = new EventEmitter();
  @Output() selectWeightSelect: EventEmitter<any> = new EventEmitter();
  @Output() selectDelete: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.selectedWidthOrFromObject$ = Rx.merge(
      this.ObjectWeight,
      this.currentWidthObservable$
    ).pipe(Rx.distinctUntilChanged());

    this.haveActiveObject.subscribe((e) => console.log('disabled:', !e));
  }

  ngOnChanges() {}

  selectLineHandler() {
    this.selectLine.emit(true);
  }

  selectCurveHandler() {
    this.selectCurve.emit(true);
  }

  selectRectHandler() {
    this.selectRectangle.emit(true);
  }

  selectCircleHandler() {
    this.selectCircle.emit(true);
  }

  selectTriangleHandler() {
    console.log('selecting the triangle');
  }

  selectMultiSelectHandler() {
    this.selectMultiSelect.emit(true);
  }

  selectWeightHandler() {
    this.showWeightPicker = true;
  }

  setWeightHandler($event: any) {
    this.currentWeight = $event;
    this.currentWidthObservable$.next($event);
    this.selectWeightSelect.emit($event);
  }

  selectFillHandler() {
    console.log('selecting the fill');
  }

  selectDeleteHandler() {
    this.selectDelete.emit(true);
  }
}
