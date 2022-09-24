import { Component } from '@angular/core';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';

@Component({
  selector: 'drawBoardPage-tools',
  template: ` <my-container>
    <my-grid>
      <my-col [col]="2"> </my-col>
      <my-col [col]="2"> </my-col>
    </my-grid>
  </my-container>`,
})
export class DrawBoardToolsComponent {
  HeadingType = HeadingType;
}
