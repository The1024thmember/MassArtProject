import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { ColorEvent } from 'ngx-color';
import * as Rx from 'rxjs';
import {
  HorizontalAlignment,
  VerticalAlignment,
} from 'src/app/ComponentLibrary/MyGrid';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { FontColor, TextSize } from 'src/app/ComponentLibrary/MyText';
import { BarColor } from 'src/app/ComponentLibrary/MyVerticalBar/myVerticalBar.component';
import { Margin } from 'src/app/Directives/Margin/margin.directive';
import { Mycolor } from '../Exp-colorPicker/colorPicker.type';

@Component({
  selector: 'Exp-colorPlatte',
  template: `
    <my-container class="Container">
      <my-container
        class="Color"
        *ngIf="!isHistoryExpanded; else HistoryExpanded"
      >
        <my-container class="Color-platte" [myMarginBottom]="Margin.XXSMALL">
          <i class="bi bi-palette-fill"></i>
          <my-container
            class="Color-platte-selection"
            [color]="
              (selectedColorFromHistoryOrObject$ | myAsync) ?? currentColor
            "
            [type]="'Selectable'"
            (click)="colorSelectorOpenHandler()"
          >
          </my-container>
        </my-container>
        <my-container *ngIf="this.colorsHistory.length" class="Color-history">
          <my-horizontal-bar
            [width]="7"
            [color]="BarColor.LIGHT"
            [myMarginBottom]="Margin.XXXSMALL"
          >
          </my-horizontal-bar>
          <my-text
            [size]="TextSize.XXXSMALL"
            [color]="FontColor.MID"
            [myMarginBottom]="Margin.XXXSMALL"
          >
            expand history
          </my-text>
          <my-button (click)="expandColorHistoryHandler()">
            <i class="bi bi-caret-down-fill"></i>
          </my-button>
        </my-container>
      </my-container>
      <ng-template #HistoryExpanded>
        <my-container class="Color">
          <my-container class="Color-platte">
            <i class="bi bi-palette-fill"></i>
            <my-container
              class="Color-platte-selection"
              [color]="
                (selectedColorFromHistoryOrObject$ | myAsync) ?? currentColor
              "
              [type]="'Selectable'"
              (click)="colorSelectorOpenHandler()"
            >
            </my-container>
          </my-container>
          <my-container class="Color-history">
            <my-container
              *ngFor="let color of colorsHistory"
              class="Color-history-record"
              [color]="color"
              [type]="'Selectable'"
              [myMarginBottom]="Margin.XXSMALL"
              (click)="selectColorFromHistoryHandler(color)"
            ></my-container>

            <my-horizontal-bar
              [width]="7"
              [color]="BarColor.LIGHT"
              [myMarginTop]="Margin.XXXSMALL"
            >
            </my-horizontal-bar>
            <my-text
              [size]="TextSize.XXXSMALL"
              [color]="FontColor.MID"
              [myMarginBottom]="Margin.XXXSMALL"
            >
              fold history
            </my-text>
            <my-button (click)="unExpandColorHistoryHandler()">
              <i class="bi bi-caret-up-fill"></i>
            </my-button>
          </my-container>
        </my-container>
      </ng-template>

      <Exp-colorPicker
        [hidden]="!(isColorPickerShown$ | myAsync)"
        [colorFromHistoryOrObject]="
          (selectedColorFromHistoryOrObject$ | myAsync) ?? currentColor
        "
        (selectedColor)="selectColorFromPlatteHandler($event)"
        (colorPickerClosed)="quiteColorPicker$.next(true)"
      ></Exp-colorPicker>
    </my-container>
  `,
  styleUrls: ['./Exp-colorPlatte.scss'],
})
export class ExpColorPlatteComponent implements OnInit, OnChanges {
  HeadingType = HeadingType;
  HorizontalAlignment = HorizontalAlignment;
  VerticalAlignment = VerticalAlignment;
  BarColor = BarColor;
  FontColor = FontColor;
  Margin = Margin;
  TextSize = TextSize;

  isHistoryExpanded: boolean = false;
  isColorPickerShown$: Rx.Observable<boolean>;

  // Place holder for future use
  colorsHistoryObject: Mycolor[];
  currentColorObject: Mycolor;

  currentColor: string = '#333';
  colorsHistory: string[] = [];

  selectedColorFromHistoryOrObject$ = new Rx.Observable<string>();
  currentColorObservable$ = new Rx.Subject<string>();

  openColorPicker$ = new Rx.Subject<boolean>();
  quiteColorPicker$ = new Rx.Subject<boolean>();

  // Need to think where to extract the string only color
  @Input() ObjectColor: Rx.Observable<string>; // The selected object color
  @Input() focusOnCanvas: Rx.Observable<boolean>; // Indicate foucs on canvas
  @Output() selectedColor: EventEmitter<string> = new EventEmitter(); // The color selected from color Platte or ColorPicker

  ngOnInit() {
    this.selectedColorFromHistoryOrObject$ = Rx.merge(
      this.ObjectColor, // The selected object color
      this.currentColorObservable$ // The color from color picker or history
    ).pipe(Rx.distinctUntilChanged());

    this.isColorPickerShown$ = Rx.merge(
      this.openColorPicker$,
      this.quiteColorPicker$.pipe(
        Rx.map((quiteWeightPicker) => !quiteWeightPicker)
      ),
      this.focusOnCanvas.pipe(Rx.map((focusOnCanvas) => !focusOnCanvas))
    );
  }

  ngOnChanges(changes: any) {}

  expandColorHistoryHandler() {
    this.isHistoryExpanded = true;
  }

  unExpandColorHistoryHandler() {
    this.isHistoryExpanded = false;
  }

  colorSelectorOpenHandler() {
    this.openColorPicker$.next(true);
  }

  selectColorFromPlatteHandler($event: ColorEvent) {
    if (!this.colorsHistory.includes(this.currentColor)) {
      if (this.colorsHistory.length < 7) {
        this.colorsHistory.unshift(this.currentColor);
      } else {
        this.colorsHistory = [
          this.currentColor,
          ...this.colorsHistory.slice(0, this.colorsHistory.length - 1),
        ];
      }
    }
    this.currentColor = $event.color.hex;

    this.currentColorObservable$.next(this.currentColor);
    this.selectedColor.emit(this.currentColor);
  }

  selectColorFromHistoryHandler($event: string) {
    this.currentColor = $event;
    this.currentColorObservable$.next(this.currentColor);
    this.selectedColor.emit(this.currentColor);
  }
}
