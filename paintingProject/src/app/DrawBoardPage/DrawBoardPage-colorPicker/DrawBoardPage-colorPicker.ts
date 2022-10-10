import { Component, OnInit } from '@angular/core';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
@Component({
  selector: 'drawBoardPage-colorPicker',
  template: `
    <my-container class="ColorPicker">
      <my-heading [headingType]="HeadingType.H3">Color Wheel</my-heading>
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage-colorPicker.scss'],
})
export class DrawBoardColorPickerComponent implements OnInit {
  HeadingType = HeadingType;
  ngOnInit() {}
}
