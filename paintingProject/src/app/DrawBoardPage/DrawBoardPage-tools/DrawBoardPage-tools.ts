import { Component } from '@angular/core';
import { HorizontalAlignment } from 'src/app/ComponentLibrary/MyGrid';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';

@Component({
  selector: 'drawBoardPage-tools',
  template: `
    <my-container [myHideMobile]="true" class="Tools">
      <my-grid [hAlign]="HorizontalAlignment.HORIZONTAL_CENTER">
        <my-col [col]="2"> Mass Art </my-col>
        <my-col [col]="6">
          <my-grid>
            <my-col [col]="2">
              <button>
                <img class="Icons" src="./assets/line.svg" />
              </button>
            </my-col>
            <my-col [col]="2">
              <button>
                <img class="Icons" src="./assets/curve.svg" />
              </button>
            </my-col>
            <my-col [col]="2">
              <button>
                <i class="bi bi-square"></i>
              </button>
            </my-col>
            <my-col [col]="2">
              <button>
                <i class="bi bi-circle"></i>
              </button>
            </my-col>
            <my-col [col]="2">
              <button>
                <i class="bi bi-triangle"></i>
              </button>
            </my-col>
          </my-grid>
        </my-col>
        <my-col [col]="2">
          <my-grid>
            <my-col [col]="6">
              <button>
                <i class="bi bi-border-width"></i>
              </button>
            </my-col>
            <my-col [col]="6">
              <button>
                <i class="bi bi-paint-bucket"></i>
              </button>
            </my-col>
          </my-grid>
        </my-col>
      </my-grid>
    </my-container>

    <my-container class="Tools" [myShowMobile]="true">
      <button>Mass</button>

      <button>
        <img class="Icons" src="./assets/line.svg" />
      </button>

      <button>
        <img class="Icons" src="./assets/curve.svg" />
      </button>

      <button>
        <i class="bi bi-square"></i>
      </button>

      <button>
        <i class="bi bi-circle"></i>
      </button>

      <button>
        <i class="bi bi-triangle"></i>
      </button>

      <button>
        <i class="bi bi-border-width"></i>
      </button>

      <button>
        <i class="bi bi-paint-bucket"></i>
      </button>
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage-tools.scss'],
})
export class DrawBoardToolsComponent {
  HeadingType = HeadingType;
  HorizontalAlignment = HorizontalAlignment;
}
