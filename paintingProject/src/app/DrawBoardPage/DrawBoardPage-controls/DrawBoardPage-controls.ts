import { Component } from '@angular/core';
import {
  HorizontalAlignment,
  VerticalAlignment,
} from 'src/app/ComponentLibrary/MyGrid';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { BarColor } from 'src/app/ComponentLibrary/MyVerticalBar/myVerticalBar.component';
import { Margin } from 'src/app/Directives/Margin';

@Component({
  selector: 'drawBoardPage-controls',
  template: `
    <my-container class="Controls">
      <my-grid
        [vAlign]="VerticalAlignment.VERTICAL_CENTER"
        [hAlign]="HorizontalAlignment.HORIZONTAL_CENTER"
      >
        <my-col [col]="2">
          <my-button>
            <i class="bi bi-arrow-counterclockwise"></i>
          </my-button>
        </my-col>
        <my-col [col]="2">
          <my-button>
            <i class="bi bi-arrow-clockwise"></i>
          </my-button>
        </my-col>

        <my-vertical-bar
          [height]="5"
          [color]="BarColor.LIGHT"
          [myMarginLeft]="Margin.SMALL"
          [myMarginRight]="Margin.SMALL"
        >
        </my-vertical-bar>

        <my-col [col]="2">
          <my-button>
            <i class="bi bi-plus-lg"></i>
          </my-button>
        </my-col>
        <my-col [col]="2">
          <my-button>
            <i class="bi bi-dash-lg"></i>
          </my-button>
        </my-col>
      </my-grid>
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage-controls.scss'],
})
export class DrawBoardControlsComponent {
  HeadingType = HeadingType;
  HorizontalAlignment = HorizontalAlignment;
  VerticalAlignment = VerticalAlignment;
  BarColor = BarColor;
  Margin = Margin;
}
