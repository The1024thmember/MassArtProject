import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ColorEvent } from 'ngx-color';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';

@Component({
  selector: 'drawBoardPage-colorPicker',
  template: `
    <my-container class="ColorPicker">
      <my-heading [headingType]="HeadingType.H3">Color Wheel</my-heading>
      <color-sketch
        (onChange)="colorChangeHandler($event)"
        (onChangeComplete)="changeComplete($event)"
      ></color-sketch>
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage-colorPicker.scss'],
})
export class DrawBoardColorPickerComponent implements OnInit {
  HeadingType = HeadingType;
  @Output() selectedColor: EventEmitter<ColorEvent> = new EventEmitter();

  ngOnInit() {}

  colorChangeHandler($event: ColorEvent) {
    console.log('onchange', $event.color);
  }

  changeComplete($event: ColorEvent) {
    console.log('complete:', $event.color);
    this.selectedColor.emit($event);
  }
}
