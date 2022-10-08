import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: `
    [myHideMobileSmall],
    [myHideMobile],
    [myHideTablet],
    [myHideDesktop],
    [myHideDesktopLarge],
    [myHideDesktopXLarge],
    [myHide],
    [myShowMobileSmall],
    [myShowMobile],
    [myShowTablet],
    [myShowDesktop],
    [myShowDesktopLarge],
    [myShowDesktopXLarge]
  `,
})
export class HideDirective {
  @HostBinding('attr.data-hide')
  @Input()
  myHide?: boolean;

  @HostBinding('attr.data-hide-mobile-small')
  @Input()
  myHideMobileSmall?: boolean;

  @HostBinding('attr.data-hide-mobile')
  @Input()
  myHideMobile?: boolean;

  @HostBinding('attr.data-hide-tablet')
  @Input()
  myHideTablet?: boolean;

  @HostBinding('attr.data-hide-desktop')
  @Input()
  myHideDesktop?: boolean;

  @HostBinding('attr.data-hide-desktop-large')
  @Input()
  myHideDesktopLarge?: boolean;

  @HostBinding('attr.data-hide-desktop-xlarge')
  @Input()
  myHideDesktopXLarge?: boolean;

  @HostBinding('attr.data-show-mobile-small')
  @Input()
  myShowMobileSmall?: boolean;

  @HostBinding('attr.data-show-mobile')
  @Input()
  myShowMobile?: boolean;

  @HostBinding('attr.data-show-tablet')
  @Input()
  myShowTablet?: boolean;

  @HostBinding('attr.data-show-desktop')
  @Input()
  myShowDesktop?: boolean;

  @HostBinding('attr.data-show-desktop-large')
  @Input()
  myShowDesktopLarge?: boolean;

  @HostBinding('attr.data-show-desktop-xlarge')
  @Input()
  myShowDesktopXLarge?: boolean;
}
