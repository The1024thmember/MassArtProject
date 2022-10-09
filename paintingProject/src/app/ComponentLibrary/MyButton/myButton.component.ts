import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { ButtonColor, ButtonStatus } from './myButton.types';

@Component({
  selector: 'my-button',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./myButton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, //check this out https://netbasal.com/a-comprehensive-guide-to-angular-onpush-change-detection-strategy-5bac493074a4
})
export class MyButtonComponent {
  @Input()
  @HostBinding('style.background-color')
  backgroundColor: ButtonColor = ButtonColor.PRIMARY;

  @Input()
  @HostBinding('attr.data-type')
  status: ButtonStatus = ButtonStatus.ACTIVE;
}
