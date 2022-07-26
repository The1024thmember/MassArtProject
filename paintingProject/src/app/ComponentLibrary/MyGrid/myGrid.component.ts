import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    Input,
} from '@angular/core';
import { HorizontalAlignment, VerticalAlignment } from './myGrid.types';

@Component({
    selector: `my-grid`,
    template: `<ng-content></ng-content>`,
    styleUrls: ['./myGrid.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyGridComponent {
    @HostBinding('attr.data-horizontal-alignment')
    @Input()
    hAlign?: HorizontalAlignment;
    @HostBinding('attr.data-vertical-alignment')
    @Input()
    vAlign?: VerticalAlignment;

    @HostBinding('attr.data-overflow')
    @Input()
    overflow = false;
}