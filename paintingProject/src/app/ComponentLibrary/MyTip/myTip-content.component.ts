import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { MytipColor, MytipPosition, MytipSize } from './Mytip.types';

@Component({
  selector: 'fl-Mytip-content',
  template: ` <ng-content></ng-content> `,
  styleUrls: ['./Mytip-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MytipContentComponent {
  @Input()
  @HostBinding('attr.data-position')
  position = MytipPosition.BOTTOM_CENTER;
  @Input()
  @HostBinding('attr.data-size')
  size = MytipSize.MID;

  @Input()
  @HostBinding('attr.data-color')
  color?: MytipColor;
}
