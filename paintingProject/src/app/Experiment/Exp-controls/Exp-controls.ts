import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as Rx from 'rxjs';
import { ButtonStatus } from 'src/app/ComponentLibrary/MyButton/myButton.types';
import {
  HorizontalAlignment,
  VerticalAlignment,
} from 'src/app/ComponentLibrary/MyGrid';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { BarColor } from 'src/app/ComponentLibrary/MyVerticalBar/myVerticalBar.component';
import { Margin } from 'src/app/Directives/Margin';

@Component({
  selector: 'Exp-controls',
  template: `
    <my-container class="Controls">
      <my-grid
        [vAlign]="VerticalAlignment.VERTICAL_CENTER"
        [hAlign]="HorizontalAlignment.HORIZONTAL_CENTER"
      >
        <my-col [col]="2">
          <my-button
            [status]="
              !(isUndoable | myAsync)
                ? ButtonStatus.DISABLED
                : ButtonStatus.ACTIVE
            "
            (click)="undoHandler()"
          >
            <i class="bi bi-arrow-counterclockwise"></i>
          </my-button>
        </my-col>
        <my-col [col]="2">
          <my-button
            [status]="
              !(isRedoable | myAsync)
                ? ButtonStatus.DISABLED
                : ButtonStatus.ACTIVE
            "
            (click)="redoHandler()"
          >
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
  styleUrls: ['./Exp-controls.scss'],
})
export class ExpControlsComponent {
  @Input() isRedoable: Rx.Observable<boolean>;
  @Input() isUndoable: Rx.Observable<boolean>;

  @Output() undoClicked: EventEmitter<boolean> = new EventEmitter();
  @Output() redoClicked: EventEmitter<boolean> = new EventEmitter();

  ButtonStatus = ButtonStatus;
  HeadingType = HeadingType;
  HorizontalAlignment = HorizontalAlignment;
  VerticalAlignment = VerticalAlignment;
  BarColor = BarColor;
  Margin = Margin;

  undoHandler() {
    this.undoClicked.emit(true);
  }

  redoHandler() {
    this.redoClicked.emit(true);
  }
}
