import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ColorEvent } from 'ngx-color';
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
            [color]="currentColor"
            [type]="'Selectable'"
            (click)="colorSetectorOpenHandler()"
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
              [color]="currentColor"
              [type]="'Selectable'"
              (click)="colorSetectorOpenHandler()"
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
        *ngIf="isColorPickerShown"
        [selectedColorFromHistory]="currentColor"
        (selectedColor)="selectColorFromPlatteHandler($event)"
      ></Exp-colorPicker>
    </my-container>
  `,
  styleUrls: ['./Exp-colorPlatte.scss'],
})
export class ExpColorPlatteComponent implements OnInit {
  HeadingType = HeadingType;
  HorizontalAlignment = HorizontalAlignment;
  VerticalAlignment = VerticalAlignment;
  BarColor = BarColor;
  FontColor = FontColor;
  Margin = Margin;
  TextSize = TextSize;

  isHistoryExpanded: boolean = false;
  isColorPickerShown: boolean = false;

  // Place holder for future use
  colorsHistoryObject: Mycolor[];
  currentColorObject: Mycolor;

  currentColor: string = '#333';
  colorsHistory: string[] = [];

  // Need to think where to extract the string only color
  @Input() selectedObjectColor: string;
  @Output() selectedColor: EventEmitter<string> = new EventEmitter();

  ngOnInit() {}

  expandColorHistoryHandler() {
    console.log('expand the history');
    this.isHistoryExpanded = true;
  }

  unExpandColorHistoryHandler() {
    console.log('fold the history');
    this.isHistoryExpanded = false;
  }

  colorSetectorOpenHandler() {
    console.log('open the color selector');
    this.isColorPickerShown = true;
  }

  selectColorFromPlatteHandler($event: ColorEvent) {
    console.log(
      'the previous used color is:',
      this.colorsHistory ? this.colorsHistory[0] : null
    );

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

    console.log('the selected color is:', $event.color.hex);
    this.currentColor = $event.color.hex;

    this.selectedColor.emit(this.currentColor);
  }

  selectColorFromHistoryHandler($event: string) {
    this.currentColor = $event;
    this.selectedColor.emit(this.currentColor);
  }
}
