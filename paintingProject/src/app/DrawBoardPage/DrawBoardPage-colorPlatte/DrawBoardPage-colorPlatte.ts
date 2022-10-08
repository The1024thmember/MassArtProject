import { Component } from '@angular/core';
import {
  HorizontalAlignment,
  VerticalAlignment,
} from 'src/app/ComponentLibrary/MyGrid';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { BarColor } from 'src/app/ComponentLibrary/MyVerticalBar/myVerticalBar.component';
import { Margin } from 'src/app/Directives/Margin/margin.directive';

@Component({
  selector: 'drawBoardPage-colorPlatte',
  template: `
    <my-container class="Color">
      <my-container class="Color-platte">
        <i class="bi bi-palette-fill"></i>
        <my-container class="Color-platte-selection"> </my-container>
      </my-container>

      <my-container class="Color-history">
        <my-horizontal-bar
          [width]="7"
          [color]="BarColor.LIGHT"
          [myMarginLeft]="Margin.SMALL"
          [myMarginRight]="Margin.SMALL"
        >
        </my-horizontal-bar>
        <button>
          <i class="bi bi-caret-down-fill"></i>
        </button>
      </my-container>
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage-colorPlatte.scss'],
})
export class DrawBoardColorPlatteComponent {
  HeadingType = HeadingType;
  HorizontalAlignment = HorizontalAlignment;
  VerticalAlignment = VerticalAlignment;
  BarColor = BarColor;
  Margin = Margin;
}
