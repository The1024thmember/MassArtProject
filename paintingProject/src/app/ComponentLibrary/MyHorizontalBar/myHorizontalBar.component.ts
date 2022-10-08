import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
type BarWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export enum BarColor {
  DARK = 'dark',
  LIGHT = 'light',
}

@Component({
  selector: 'my-horizontal-bar',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./myHorizontalBar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyHorizontalBarComponent {
  @HostBinding('attr.data-width')
  @Input()
  width?: BarWidth;

  @HostBinding('attr.data-color')
  @Input()
  color?: BarColor;
}
