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
        [value]="setWidthValueFromSelection"
        (input)="setWeightValueContinuous(weightSetter.value)"
      />
    </my-container>
  `,
  styleUrls: ['./DrawBoardPage-weightPicker.scss'],
})
export class DrawBoardColorWeightComponent implements OnInit, OnChanges {
  @Input() maxWeight: number;
  @Input() setWidthValueFromSelection: number;
  //Set whenever the cursor moves
  @Output() selectedWeight: EventEmitter<ColorEvent> = new EventEmitter();
  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {}

  setWeightValueContinuous($event: any) {
    this.selectedWeight.emit($event);
  }
}
