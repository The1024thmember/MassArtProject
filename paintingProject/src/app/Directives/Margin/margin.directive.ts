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
  flMarginRight?: Margin;

  @HostBinding('attr.data-margin-bottom')
  @Input()
  flMarginBottom?: Margin;

  @HostBinding('attr.data-margin-right-tablet')
  @Input()
  flMarginRightTablet?: Margin;

  @HostBinding('attr.data-margin-bottom-tablet')
  @Input()
  flMarginBottomTablet?: Margin;

  @HostBinding('attr.data-margin-right-desktop')
  @Input()
  flMarginRightDesktop?: Margin;

  @HostBinding('attr.data-margin-bottom-desktop')
  @Input()
  flMarginBottomDesktop?: Margin;

  @HostBinding('attr.data-margin-right-desktop-large')
  @Input()
  flMarginRightDesktopLarge?: Margin;

  @HostBinding('attr.data-margin-bottom-desktop-large')
  @Input()
  flMarginBottomDesktopLarge?: Margin;
}
