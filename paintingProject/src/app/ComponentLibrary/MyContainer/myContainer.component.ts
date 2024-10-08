import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

type containerType = 'Normal' | 'Selectable';
@Component({
  selector: 'my-container',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./myContainer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, //check this out https://netbasal.com/a-comprehensive-guide-to-angular-onpush-change-detection-strategy-5bac493074a4
})
export class MyContainerComponent {
  @Input()
  @HostBinding('style.background-color')
  color?: string;

  @Input()
  @HostBinding('attr.data-type')
  type: containerType = 'Normal';
}
