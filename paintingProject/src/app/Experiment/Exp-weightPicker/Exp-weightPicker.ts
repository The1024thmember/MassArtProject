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

@Component({
  selector: 'Exp-weightPicker',
  template: `
    <my-container class="WeightPicker">
      <input
        #weightSetter
        name="ram"
        type="range"
        min="1"
        [max]="maxWeight"
        [value]="setWidthValueFromSelection"
        (input)="setWeightValueContinuous(weightSetter.value)"
      />
      <my-button (click)="isWeightPickerClosed.emit()">X</my-button>
    </my-container>
  `,
  styleUrls: ['./Exp-weightPicker.scss'],
})
export class ExpColorWeightComponent implements OnInit, OnChanges {
  @Input() maxWeight: number;
  @Input() setWidthValueFromSelection: number;
  //Set whenever the cursor moves
  @Output() selectedWeight: EventEmitter<ColorEvent> = new EventEmitter();
  @Output() isWeightPickerClosed: EventEmitter<ColorEvent> = new EventEmitter();
  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {}

  setWeightValueContinuous($event: any) {
    this.selectedWeight.emit($event);
  }
}
