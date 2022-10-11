import { Component } from '@angular/core';
import { Margin } from '../Directives/Margin';

@Component({
  template: `
    <my-container class="Container">
      <my-grid class="Container-firstRowTools">
        <my-col [col]="5">
          <drawBoardPage-tools></drawBoardPage-tools>
        </my-col>
        <my-col [col]="5">
          <drawBoardPage-controls></drawBoardPage-controls>
        </my-col>
        <my-col [col]="2">
          <drawBoardPage-userPanel></drawBoardPage-userPanel>
        </my-col>
      </my-grid>
      <drawBoardPage-colorPlatte></drawBoardPage-colorPlatte>
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage.scss'],
})
export class DrawBoardPageComponent {
  Margin = Margin;
}
