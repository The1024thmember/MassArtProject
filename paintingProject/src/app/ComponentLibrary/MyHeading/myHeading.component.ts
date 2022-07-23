import  {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {HeadingType, HeadingColor, HeadingWeight} from './myHeading.types';
import { TextSize } from '../MyText';

@Component({
    selector: 'my-heading',
    template: `
        <ng-container [ngSwitch]="headingType">
            <h1 
                *ngSwitchCase="HeadingType.H1"
                [attr.data-color]="color"
                [attr.data-inline]="inline"
                [attr.data-size]="size"
                [attr.data-size-tablet]="sizeTablet"
                [attr.data-size-desktop]="sizeDesktop"
                [attr.data-size-desktop-xlarge]="sizeDesktopXLarge"
                [attr.data-truncate]="truncate"
                [attr.data-weight]="weight"
            >
                <ng-container *ngTemplateOutlet="injectedContent"></ng-container>
            </h1>
            <h2 
            *ngSwitchCase="HeadingType.H2"
            [attr.data-color]="color"
            [attr.data-inline]="inline"
            [attr.data-size]="size"
            [attr.data-size-tablet]="sizeTablet"
            [attr.data-size-desktop]="sizeDesktop"
            [attr.data-size-desktop-xlarge]="sizeDesktopXLarge"
            [attr.data-truncate]="truncate"
            [attr.data-weight]="weight"
            >
                <ng-container *ngTemplateOutlet="injectedContent"></ng-container>
            </h2>
            <h3 
            *ngSwitchCase="HeadingType.H3"
            [attr.data-color]="color"
            [attr.data-inline]="inline"
            [attr.data-size]="size"
            [attr.data-size-tablet]="sizeTablet"
            [attr.data-size-desktop]="sizeDesktop"
            [attr.data-size-desktop-xlarge]="sizeDesktopXLarge"
            [attr.data-truncate]="truncate"
            [attr.data-weight]="weight"
            >
                <ng-container *ngTemplateOutlet="injectedContent"></ng-container>
            </h3>
            <h4 
                *ngSwitchCase="HeadingType.H4"
                [attr.data-color]="color"
                [attr.data-inline]="inline"
                [attr.data-size]="size"
                [attr.data-size-tablet]="sizeTablet"
                [attr.data-size-desktop]="sizeDesktop"
                [attr.data-size-desktop-xlarge]="sizeDesktopXLarge"
                [attr.data-truncate]="truncate"
                [attr.data-weight]="weight"
            >
                <ng-container *ngTemplateOutlet="injectedContent"></ng-container>
            </h4>
            <h5 
            *ngSwitchCase="HeadingType.H5"
            [attr.data-color]="color"
            [attr.data-inline]="inline"
            [attr.data-size]="size"
            [attr.data-size-tablet]="sizeTablet"
            [attr.data-size-desktop]="sizeDesktop"
            [attr.data-size-desktop-xlarge]="sizeDesktopXLarge"
            [attr.data-truncate]="truncate"
            [attr.data-weight]="weight"
            >
                <ng-container *ngTemplateOutlet="injectedContent"></ng-container>
            </h5>
            <h6 
            *ngSwitchCase="HeadingType.H6"
            [attr.data-color]="color"
            [attr.data-inline]="inline"
            [attr.data-size]="size"
            [attr.data-size-tablet]="sizeTablet"
            [attr.data-size-desktop]="sizeDesktop"
            [attr.data-size-desktop-xlarge]="sizeDesktopXLarge"
            [attr.data-truncate]="truncate"
            [attr.data-weight]="weight"
            >
                <ng-container *ngTemplateOutlet="injectedContent"></ng-container>
            </h6>  
            <ng-template #injectedContent>
                <ng-content>
                </ng-content>
            </ng-template>                      
        <ng-container>
    `,
    styleUrls: ['myHeading.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MyHeadingComponent {

    //ng-container *ngTemplateOutlet uses "injectedContent" as embeded reference, and thus uses ng-template which has #injectedContent
    //as template for displaying the content in the place where ng-container is defined

    HeadingType = HeadingType;
    HeadingColor = HeadingColor;
    HeadingWeight = HeadingWeight;

    @Input() headingType: HeadingType;

    @Input() color = HeadingColor.DARK;

    @Input() size: TextSize;

    @Input() sizeTablet?: TextSize;

    @Input() sizeDesktop?: TextSize;

    @Input() sizeDesktopXLarge?: TextSize;

    @Input() weight?: HeadingWeight.BOLD;

    @Input() truncate = false;

    @Input() inline = false;
}