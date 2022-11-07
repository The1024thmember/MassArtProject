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

  @Input() colorFromHistoryOrObject: string; //The color set from history or selected object
  @Output() selectedColor: EventEmitter<ColorEvent> = new EventEmitter();

  ngOnInit() {
    console.log(
      'Exp-colorPicker colorFromHistoryOrObject:',
      this.colorFromHistoryOrObject
    );
  }

  ngOnChanges(changes: SimpleChanges): void {}

  colorChangeHandler($event: ColorEvent) {}

  changeComplete($event: ColorEvent) {
    this.selectedColor.emit($event);
  }
}
