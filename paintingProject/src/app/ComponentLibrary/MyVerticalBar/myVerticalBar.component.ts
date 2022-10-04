import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
type BarHeight = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export enum BarColor {
  DARK = 'dark',
  LIGHT = 'light',
}

@Component({
  selector: 'my-vertical-bar',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./myVerticalBar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyVerticalBarComponent {
  @HostBinding('attr.data-height')
  @Input()
  height: BarHeight;

  @HostBinding('attr.data-color')
  @Input()
  color?: BarColor;
}
