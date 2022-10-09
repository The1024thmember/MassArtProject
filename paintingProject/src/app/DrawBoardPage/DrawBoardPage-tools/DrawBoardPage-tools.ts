import { Component } from '@angular/core';
import {
  HorizontalAlignment,
  VerticalAlignment,
} from 'src/app/ComponentLibrary/MyGrid';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { BarColor } from 'src/app/ComponentLibrary/MyVerticalBar/myVerticalBar.component';
import { Margin } from 'src/app/Directives/Margin/margin.directive';

@Component({
  selector: 'drawBoardPage-tools',
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
        <my-col class="pens" [col]="6">
          <my-grid>
            <my-col [col]="2">
              <my-button>
                <img class="Icons" src="./assets/line.svg" />
              </my-button>
            </my-col>
            <my-col [col]="2">
              <my-button>
                <img class="Icons" src="./assets/curve.svg" />
              </my-button>
            </my-col>
            <my-col [col]="2">
              <my-button>
                <i class="bi bi-square"></i>
              </my-button>
            </my-col>
            <my-col [col]="2">
              <my-button>
                <i class="bi bi-circle"></i>
              </my-button>
            </my-col>
            <my-col [col]="2">
              <my-button>
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
        <my-col [col]="2">
          <my-grid>
            <my-col [col]="6">
              <my-button>
                <i class="bi bi-border-width"></i>
              </my-button>
            </my-col>
            <my-col [col]="6">
              <my-button>
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
      <my-button>
        <img class="Icons" src="./assets/line.svg" />
      </my-button>

      <my-button>
        <img class="Icons" src="./assets/curve.svg" />
      </my-button>

      <my-button>
        <i class="bi bi-square"></i>
      </my-button>

      <my-button>
        <i class="bi bi-circle"></i>
      </my-button>

      <my-button>
        <i class="bi bi-triangle"></i>
      </my-button>
      <my-horizontal-bar
        [myMarginLeft]="Margin.SMALL"
        [width]="5"
        [color]="BarColor.LIGHT"
      ></my-horizontal-bar>
      <my-button>
        <i class="bi bi-border-width"></i>
      </my-button>

      <my-button>
        <i class="bi bi-paint-bucket"></i>
      </my-button>
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage-tools.scss'],
})
export class DrawBoardToolsComponent {
  HeadingType = HeadingType;
  HorizontalAlignment = HorizontalAlignment;
  VerticalAlignment = VerticalAlignment;
  BarColor = BarColor;
  Margin = Margin;
}
