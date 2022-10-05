import { Component } from '@angular/core';
import {
  HorizontalAlignment,
  VerticalAlignment,
} from 'src/app/ComponentLibrary/MyGrid';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { BarColor } from 'src/app/ComponentLibrary/MyVerticalBar/myVerticalBar.component';
import { Margin } from 'src/app/Directives/Margin/margin.directive';

@Component({
  selector: 'drawBoardPage-userPanel',
  template: `
    <my-container class="UserPanel">
      <my-grid
        [vAlign]="VerticalAlignment.VERTICAL_CENTER"
        [hAlign]="HorizontalAlignment.HORIZONTAL_CENTER"
      >
        <my-col [col]="2">
          <button>
            <i class="bi bi-person"></i>
          </button>
        </my-col>
        <my-vertical-bar
          [height]="5"
          [color]="BarColor.LIGHT"
          [myMarginLeft]="Margin.SMALL"
          [myMarginRight]="Margin.SMALL"
        >
        </my-vertical-bar>
        <my-col [col]="5">
          <button>Share</button>
        </my-col>
      </my-grid>
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage-userPanel.scss'],
})
export class DrawBoardUserPanelComponent {
  HeadingType = HeadingType;
  HorizontalAlignment = HorizontalAlignment;
  VerticalAlignment = VerticalAlignment;
  BarColor = BarColor;
  Margin = Margin;
}
