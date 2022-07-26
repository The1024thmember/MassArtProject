import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

type ColumnNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type ColumnNumberTablet = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type ColumnNumberDesktopSmall =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

type ColumnNumberDesktopLarge =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

type ColumnOrder = 1 | 2 | 3 | 4 | 5 | 6;
type TabletColumnOrder = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type DesktopSmallColumnOrder = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type DesktopLargeColumnOrder = 1 | 2 | 3;
type ColumnPull = 'left' | 'right';

@Component({
  selector: 'my-col',
  template: ` <ng-content></ng-content> `,
  styleUrls: ['./myColumn.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyColumnComponent {
  @HostBinding('attr.data-col')
  @Input()
  col?: ColumnNumber;
  @HostBinding('attr.data-order')
  @Input()
  colOrder?: ColumnOrder;

  @HostBinding('attr.data-col-tablet')
  @Input()
  colTablet?: ColumnNumberTablet;
  @HostBinding('attr.data-tablet-order')
  @Input()
  colTabletOrder?: TabletColumnOrder;

  @HostBinding('attr.data-col-desktop-small')
  @Input()
  colDesktopSmall?: ColumnNumberDesktopSmall;
  @HostBinding('attr.data-desktop-small-order')
  @Input()
  colDesktopSmallOrder?: DesktopSmallColumnOrder;

  @HostBinding('attr.data-col-desktop-large')
  @Input()
  colDesktopLarge?: ColumnNumberDesktopLarge;
  @HostBinding('attr.data-desktop-large-order')
  @Input()
  colDesktopLargeOrder?: DesktopLargeColumnOrder;

  @HostBinding('attr.data-pull')
  @Input()
  pull?: ColumnPull;

  @HostBinding('attr.data-flex-container')
  @Input()
  flexContainer = false;
}
