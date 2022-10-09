import { Component, OnInit } from '@angular/core';
import {
  HorizontalAlignment,
  VerticalAlignment,
} from 'src/app/ComponentLibrary/MyGrid';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { FontColor, TextSize } from 'src/app/ComponentLibrary/MyText';
import { BarColor } from 'src/app/ComponentLibrary/MyVerticalBar/myVerticalBar.component';
import { Margin } from 'src/app/Directives/Margin/margin.directive';

@Component({
  selector: 'drawBoardPage-colorPlatte',
  template: `
    <my-container
      class="Color"
      *ngIf="!isHistoryExpanded; else HistoryExpanded"
    >
      <my-container class="Color-platte">
        <i class="bi bi-palette-fill"></i>
        <my-container
          class="Color-platte-selection"
          [color]="'#333'"
          [type]="'Selectable'"
        >
        </my-container>
      </my-container>
      <my-container class="Color-history">
        <my-horizontal-bar
          [width]="7"
          [color]="BarColor.LIGHT"
          [myMarginLeft]="Margin.SMALL"
          [myMarginRight]="Margin.SMALL"
        >
        </my-horizontal-bar>
        <my-text [size]="TextSize.XXXSMALL" [color]="FontColor.MID">
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
            [color]="'#333'"
            [type]="'Selectable'"
          >
          </my-container>
        </my-container>
        <my-container class="Color-history">
          <my-container
            *ngFor="let color of colors"
            class="Color-history-record"
            [color]="color"
            [type]="'Selectable'"
          ></my-container>

          <my-horizontal-bar
            [width]="7"
            [color]="BarColor.LIGHT"
            [myMarginTop]="Margin.SMALL"
            [myMarginLeft]="Margin.SMALL"
            [myMarginRight]="Margin.SMALL"
          >
          </my-horizontal-bar>
          <my-text [size]="TextSize.XXXSMALL" [color]="FontColor.MID">
            fold history
          </my-text>
          <my-button (click)="unExpandColorHistoryHandler()">
            <i class="bi bi-caret-up-fill"></i>
          </my-button>
        </my-container>
      </my-container>
    </ng-template>
  `,
  styleUrls: ['./DrawBoardPage-colorPlatte.scss'],
})
export class DrawBoardColorPlatteComponent implements OnInit {
  HeadingType = HeadingType;
  HorizontalAlignment = HorizontalAlignment;
  VerticalAlignment = VerticalAlignment;
  BarColor = BarColor;
  FontColor = FontColor;
  Margin = Margin;
  TextSize = TextSize;
  isHistoryExpanded: boolean = false;

  colors = ['#33f', '#3ff', '#e4d'];

  ngOnInit() {}

  expandColorHistoryHandler() {
    console.log('expand the history');
    this.isHistoryExpanded = true;
  }

  unExpandColorHistoryHandler() {
    console.log('fold the history');
    this.isHistoryExpanded = false;
  }
}
