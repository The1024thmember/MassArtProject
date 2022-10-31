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
  selector: 'drawBoardPage-weightPicker',
  template: `
    <my-container class="WeightPicker">
      <input
        #weightSetter
        name="ram"
        type="range"
        min="1"
        [max]="maxWeight"
        [value]="2"
        (input)="setWeightValue(weightSetter.value)"
      />
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage-weightPicker.scss'],
})
export class DrawBoardColorWeightComponent implements OnInit, OnChanges {
  @Input() maxWeight: number;
  @Output() selectedWeight: EventEmitter<ColorEvent> = new EventEmitter();

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {}

  setWeightValue($event: any) {
    this.selectedWeight.emit($event);
  }
}
