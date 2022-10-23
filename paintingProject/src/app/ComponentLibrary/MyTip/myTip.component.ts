import type {
  ConnectedPosition,
  ConnectionPositionPair,
  OriginConnectionPosition,
  OverlayConnectionPosition,
  OverlayRef,
} from '@angular/cdk/overlay';
import { Overlay, OverlayConfig, ScrollDispatcher } from '@angular/cdk/overlay';
import { CdkPortal } from '@angular/cdk/portal';
import type { OnDestroy } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';

import { Margin } from 'src/app/Directives/Margin';
import { MytipColor, MytipPosition, MytipSize } from './myTip.types';

// TODO: T267853 - More features.
// - Animations (T38383)
// - Hide delay (T38384)
@Component({
  selector: 'Mytip',
  template: `
    <fl-bit
      class="MytipContainer"
      (touchstart)="onTouchStart()"
      (touchend)="onTouchEnd()"
    >
      <span class="IconWrapper" [ngClass]="{ DefaultIcon: defaultIcon }">
        <span class="IconContent">
          <ng-content></ng-content>
        </span>
        <fl-bit class="IconContainer IconContent" *ngIf="defaultIcon">
          <fl-icon [name]="'ui-info-outline'" [size]="IconSize.SMALL"></fl-icon>
        </fl-bit>
      </span>

      <ng-template cdk-portal>
        <fl-Mytip-content
          [position]="currentPosition"
          [size]="size"
          [color]="color"
        >
          {{ message }}
        </fl-Mytip-content>
      </ng-template>
    </fl-bit>
  `,
  styleUrls: ['./Mytip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MytipComponent implements OnDestroy {
  Margin = Margin;

  @Input() message?: string;
  @Input() position: MytipPosition;
  @Input() size = MytipSize.MID;
  @Input() color?: MytipColor;

  /** Use the default icon provided by this component */
  @Input() defaultIcon = false;

  currentPosition: MytipPosition = MytipPosition.BOTTOM_CENTER;
  private overlayRef?: OverlayRef;

  @ViewChild(CdkPortal)
  portal: CdkPortal;

  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef<HTMLElement>,
    private scrollDispatcher: ScrollDispatcher,
    private changeDetector: ChangeDetectorRef,
    private timeUtils: TimeUtils
  ) {}

  @HostListener('mouseenter')
  onMouseenter() {
    this.show();
  }

  @HostListener('mouseleave')
  onMouseleave() {
    this.hide();
  }

  ngOnDestroy() {
    this.dispose();
  }

  show() {
    if (
      !this.message ||
      !this.message.trim() ||
      this.overlayRef !== undefined
    ) {
      return;
    }

    this.overlayRef = this.createOverlay();
    this.overlayRef.attach(this.portal);
  }

  hide() {
    this.dispose();
  }

  private dispose() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }

  private getOverlayPosition(): OverlayConnectionPosition {
    const position = this.currentPosition.split('-');

    const anchor = position[0];
    const relativePosition = position[1];

    if (
      (anchor === 'top' || anchor === 'bottom') &&
      (relativePosition === 'start' ||
        relativePosition === 'center' ||
        relativePosition === 'end')
    ) {
      return {
        overlayX: relativePosition,
        overlayY: anchor === 'top' ? 'bottom' : 'top',
      };
    }

    if (
      (anchor === 'start' || anchor === 'end') &&
      (relativePosition === 'top' ||
        relativePosition === 'center' ||
        relativePosition === 'bottom')
    ) {
      return {
        overlayX: anchor === 'start' ? 'end' : 'start',
        overlayY: relativePosition,
      };
    }

    throw Error('No position for Mytip specified!');
  }

  private getOrigin(): OriginConnectionPosition {
    const position = this.currentPosition.split('-');

    const anchor = position[0];
    const relativePosition = position[1];

    if (
      (anchor === 'top' || anchor === 'bottom') &&
      (relativePosition === 'start' ||
        relativePosition === 'center' ||
        relativePosition === 'end')
    ) {
      return { originX: relativePosition, originY: anchor };
    }

    if (
      (anchor === 'start' || anchor === 'end') &&
      (relativePosition === 'top' ||
        relativePosition === 'center' ||
        relativePosition === 'bottom')
    ) {
      return {
        originX: anchor,
        originY: relativePosition,
      };
    }

    throw Error('No position for Mytip specified!');
  }

  private getPositions(position: ConnectedPosition): ConnectedPosition[] {
    return [
      position,
      {
        // Fallback position is the inverse of the original
        originX: position.overlayX,
        originY: position.overlayY,
        overlayX: position.originX,
        overlayY: position.originY,
      },
    ];
  }

  // Returns typed position
  private getMytipPosition(anchor: string, relativePosition: string) {
    const position = `${anchor}-${relativePosition}`;

    return Object.values(MytipPosition).filter(
      (value) => position === value
    )[0];
  }

  private updateMytipArrowPosition(connectionPair: ConnectionPositionPair) {
    const prevPosition = this.currentPosition;
    const prevAnchorPosition = prevPosition.split('-')[0];

    if (prevAnchorPosition === 'top' || prevAnchorPosition === 'bottom') {
      this.currentPosition = this.getMytipPosition(
        connectionPair.originY,
        connectionPair.originX
      );
    } else {
      this.currentPosition = this.getMytipPosition(
        connectionPair.originX,
        connectionPair.originY
      );
    }

    this.changeDetector.markForCheck();
  }

  private createOverlay() {
    if (this.position) {
      this.currentPosition = this.position;
    }

    const { originX, originY } = this.getOrigin();
    const { overlayX, overlayY } = this.getOverlayPosition();
    const positions = this.getPositions({
      originX,
      originY,
      overlayX,
      overlayY,
    });

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(positions)
      .withScrollableContainers(
        this.scrollDispatcher.getAncestorScrollContainers(this.elementRef)
      );

    // Closes Mytip when scrolled
    const scrollStrategy = this.overlay.scrollStrategies.close();

    const state = new OverlayConfig({
      positionStrategy,
      scrollStrategy,
    });

    return this.overlay.create(state);
  }
}
