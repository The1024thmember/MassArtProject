import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ColorEvent } from 'ngx-color';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';

@Component({
  selector: 'Exp-colorPicker',
  template: `
    <my-container class="ColorPicker">
      <my-heading [headingType]="HeadingType.H3">Color Wheel</my-heading>
      <color-sketch
        [color]="colorFromHistoryOrObject"
        (onChange)="colorChangeHandler($event)"
        (onChangeComplete)="changeComplete($event)"
      ></color-sketch>
    </my-container>
  `,
  styleUrls: ['./Exp-colorPicker.scss'],
})
export class ExpColorPickerComponent implements OnInit, OnChanges {
  HeadingType = HeadingType;

  @Input() colorFromHistoryOrObject: string;
  @Output() selectedColor: EventEmitter<ColorEvent> = new EventEmitter();

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('change color to set:', this.colorFromHistoryOrObject);
  }

  colorChangeHandler($event: ColorEvent) {
    console.log('onchange', $event.color);
  }

  changeComplete($event: ColorEvent) {
    console.log('complete:', $event.color);
    this.selectedColor.emit($event);
  }
}
