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
    [myMarginLeft],
    [myMarginRight],
    [myMarginBottom],
    [myMarginLeftTablet],
    [myMarginRightTablet],
    [myMarginBottomTablet],
    [myMarginLeftDesktop],
    [myMarginRightDesktop],
    [myMarginBottomDesktop],
    [myMarginLeftDesktopLarge],
    [myMarginRightDesktopLarge],
    [myMarginBottomDesktopLarge],
  `,
})
export class MarginDirective {
  @HostBinding('attr.data-margin-left')
  @Input()
  myMarginLeft?: Margin;

  @HostBinding('attr.data-margin-right')
  @Input()
  myMarginRight?: Margin;

  @HostBinding('attr.data-margin-bottom')
  @Input()
  myMarginBottom?: Margin;

  @HostBinding('attr.data-margin-left-tablet')
  @Input()
  myMarginLeftTablet?: Margin;

  @HostBinding('attr.data-margin-right-tablet')
  @Input()
  myMarginRightTablet?: Margin;

  @HostBinding('attr.data-margin-bottom-tablet')
  @Input()
  myMarginBottomTablet?: Margin;

  @HostBinding('attr.data-margin-left-desktop')
  @Input()
  myMarginLeftDesktop?: Margin;

  @HostBinding('attr.data-margin-right-desktop')
  @Input()
  myMarginRightDesktop?: Margin;

  @HostBinding('attr.data-margin-bottom-desktop')
  @Input()
  myMarginBottomDesktop?: Margin;

  @HostBinding('attr.data-margin-left-desktop-large')
  @Input()
  myMarginLeftDesktopLarge?: Margin;

  @HostBinding('attr.data-margin-right-desktop-large')
  @Input()
  myMarginRightDesktopLarge?: Margin;

  @HostBinding('attr.data-margin-bottom-desktop-large')
  @Input()
  myMarginBottomDesktopLarge?: Margin;
}
