import type { OnDestroy, OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import * as Rx from 'rxjs';
import { MaxLinesHelper } from './max-lines.helper';
import {
  FontColor,
  FontStyle,
  FontType,
  FontWeight,
  HighlightColor,
  ReadMore,
  ReadMoreColor,
  TextAlign,
  TextSize,
  TextTransform,
} from './myText.types';

@Component({
  selector: 'my-text',
  template: `
    <ng-container [ngSwitch]="fontType">
      <div
        *ngSwitchCase="FontType.PARAGRAPH"
        class="NativeElement"
        role="paragraph"
        [attr.data-text-transform]="textTransform"
        [attr.data-color]="color"
        [attr.data-size]="size"
        [attr.data-size-tablet]="sizeTablet"
        [attr.data-size-desktop]="sizeDesktop"
        [attr.data-size-desktop-xlarge]="sizeDesktopXLarge"
        [attr.data-weight]="weight"
        [attr.data-weight-tablet]="weightTablet"
        [attr.data-weight-desktop]="weightDesktop"
        [attr.data-style]="style"
        [attr.data-line-break]="displayLineBreaks"
      >
        <ng-container *ngTemplateOutlet="injectedContent"></ng-container>
      </div>
      <span
        *ngSwitchCase="FontType.SPAN"
        class="NativeElement"
        [attr.data-text-transform]="textTransform"
        [attr.data-color]="color"
        [attr.data-size]="size"
        [attr.data-size-tablet]="sizeTablet"
        [attr.data-size-desktop]="sizeDesktop"
        [attr.data-size-desktop-xlarge]="sizeDesktopXLarge"
        [attr.data-weight]="weight"
        [attr.data-weight-tablet]="weightTablet"
        [attr.data-weight-desktop]="weightDesktop"
        [attr.data-style]="style"
        [attr.data-line-break]="displayLineBreaks"
      >
        <ng-container *ngTemplateOutlet="injectedContent"></ng-container>
      </span>
      <strong
        *ngSwitchCase="FontType.STRONG"
        class="NativeElement Strong"
        [attr.data-text-transform]="textTransform"
        [attr.data-color]="color"
        [attr.data-size]="size"
        [attr.data-size-tablet]="sizeTablet"
        [attr.data-size-desktop]="sizeDesktop"
        [attr.data-size-desktop-xlarge]="sizeDesktopXLarge"
        [attr.data-weight]="weight"
        [attr.data-weight-tablet]="weightTablet"
        [attr.data-weight-desktop]="weightDesktop"
        [attr.data-style]="style"
        [attr.data-line-break]="displayLineBreaks"
      >
        <ng-container *ngTemplateOutlet="injectedContent"></ng-container>
      </strong>
      <!-- this one's also a div but doesn't have paragraph semantics -->
      <div
        *ngSwitchCase="FontType.CONTAINER"
        class="NativeElement"
        [attr.data-text-transform]="textTransform"
        [attr.data-color]="color"
        [attr.data-size]="size"
        [attr.data-size-tablet]="sizeTablet"
        [attr.data-size-desktop]="sizeDesktop"
        [attr.data-size-desktop-xlarge]="sizeDesktopXLarge"
        [attr.data-weight]="weight"
        [attr.data-weight-tablet]="weightTablet"
        [attr.data-weight-desktop]="weightDesktop"
        [attr.data-style]="style"
        [attr.data-line-break]="displayLineBreaks"
      >
        <ng-container *ngTemplateOutlet="injectedContent"></ng-container>
      </div>
      <ng-template #injectedContent>
        <ng-content></ng-content>
      </ng-template>
    </ng-container>
  `,
  styleUrls: ['./myText.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyTextComponent implements OnDestroy, OnInit {
  FontType = FontType;

  @Input()
  @HostBinding('attr.data-color')
  color = FontColor.DARK;

  /**
   * Text selection color
   */
  @HostBinding('attr.data-highlight-color')
  @Input()
  highlightColor?: HighlightColor;

  /**
   * Font size for mobile and above
   */
  @Input() size: TextSize = TextSize.XSMALL;

  /**
   * Change the [size] from tablet and above
   */
  @Input() sizeTablet?: TextSize;

  /**
   * Change the [size] and/or [sizeTablet] from desktop and above
   */
  @Input() sizeDesktop?: TextSize;

  /** Change the [size], [sizeTablet] and [sizeDesktop] from desktop-xlarge and above */
  @Input() sizeDesktopXLarge?: TextSize;

  @Input() style = FontStyle.NORMAL;

  /** Change the text-align property (only works on fontType.PARAGRAPH) */
  @HostBinding('attr.data-text-align')
  @Input()
  textAlign?: TextAlign;

  @HostBinding('attr.data-text-align-tablet')
  @Input()
  textAlignTablet?: TextAlign;

  @HostBinding('attr.data-text-align-desktop-small')
  @Input()
  textAlignDesktopSmall?: TextAlign;

  @Input() textTransform?: TextTransform;

  @Input() weight = FontWeight.NORMAL;
  @Input() weightTablet?: FontWeight;
  @Input() weightDesktop?: FontWeight;

  /** Defines the HTML node it will use e.g (<p>, <span>, <strong>)
   *  Note: This is for semantics usage which defaults to a <p> tag
   */
  @HostBinding('attr.data-type')
  @Input()
  fontType = FontType.PARAGRAPH;

  /**
   * Default false, true will parse the \n, <br> tags in the string to create a new line
   * Will break the line when maxLines=false, or maxLines=true and readmore clicked
   */
  @Input() displayLineBreaks = false;

  /*
   * Maximum number of lines of text to display before truncating
   */
  @Input()
  @HostBinding('attr.data-max-lines')
  maxLines?: number;

  /*
   * Paired with [maxLines].
   * Displays "Read more" link or icon.
   */
  @Input()
  @HostBinding('attr.data-read-more')
  readMore = ReadMore.NONE;

  @Input() readMoreColor?: ReadMoreColor;

  /**
   * Paired with [maxLines].
   * Limit the height to prevent UI flickering during truncation in initialization.
   * This is an optional field when maxLines is set. However, it is recommended when using TextSize.INHERIT
   * to supply a custom value depending on the text size and line height we inherit from.
   */
  @Input()
  @HostBinding('style.max-height')
  maxHeight?: string;

  @HostBinding('style.overflow')
  overflow: string;

  @Output()
  expand = new EventEmitter<boolean>();

  private maxLinesHelper: MaxLinesHelper;
  private container: HTMLElement;
  private windowSize: { width?: number; height?: number } = {};
  private originalContainer: Node;
  private isInTransition: boolean;
  private isExpanded: boolean;
  private subscriptions = new Rx.Subscription();

  ngOnInit() {
    // Set the max height to prevent UI flickering before the text is.
    if (this.maxLines && !this.maxHeight) {
      // FIXME: T267853 - share CSS variables with JS
      let lineHeightUi: number;
      let fontSizeUi: number;

      switch (this.size) {
        case TextSize.SMALL:
          lineHeightUi = 1.5;
          fontSizeUi = 16;
          break;
        case TextSize.XXSMALL:
          lineHeightUi = 1.2;
          fontSizeUi = 13;
          break;
        default:
          lineHeightUi = 1.43;
          fontSizeUi = 14;
      }

      this.maxHeight = `${this.maxLines * lineHeightUi * fontSizeUi}px`;
      this.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  destroyListeners() {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Rx.Subscription();
  }
}
