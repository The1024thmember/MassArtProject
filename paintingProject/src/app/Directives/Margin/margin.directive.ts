import { Directive, HostBinding, Input } from '@angular/core';

export enum Margin {
  NONE = 'none',
  XXXSMALL = 'xxxsmall',
  XXSMALL = 'xxsmall',
  XSMALL = 'xsmall',
  SMALL = 'small',
  MID = 'mid',
  LARGE = 'large',
  XLARGE = 'xlarge',
  XXLARGE = 'xxlarge',
  XXXLARGE = 'xxxlarge',
  XXXXLARGE = 'xxxxlarge',
}

@Directive({
  selector: `
    [myMarginRight],
    [myMarginBottom],
    [myMarginRightTablet],
    [myMarginBottomTablet],
    [myMarginRightDesktop],
    [myMarginBottomDesktop],
    [myMarginRightDesktopLarge],
    [myMarginBottomDesktopLarge],
  `,
})
export class MarginDirective {
  @HostBinding('attr.data-margin-right')
  @Input()
  myMarginRight?: Margin;

  @HostBinding('attr.data-margin-bottom')
  @Input()
  myMarginBottom?: Margin;

  @HostBinding('attr.data-margin-right-tablet')
  @Input()
  myMarginRightTablet?: Margin;

  @HostBinding('attr.data-margin-bottom-tablet')
  @Input()
  myMarginBottomTablet?: Margin;

  @HostBinding('attr.data-margin-right-desktop')
  @Input()
  myMarginRightDesktop?: Margin;

  @HostBinding('attr.data-margin-bottom-desktop')
  @Input()
  myMarginBottomDesktop?: Margin;

  @HostBinding('attr.data-margin-right-desktop-large')
  @Input()
  myMarginRightDesktopLarge?: Margin;

  @HostBinding('attr.data-margin-bottom-desktop-large')
  @Input()
  myMarginBottomDesktopLarge?: Margin;
}
