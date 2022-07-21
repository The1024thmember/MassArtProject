import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector:'my-container',
    template:`<ng-content></ng-content>`,
    styleUrls:['./container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush, //check this out https://netbasal.com/a-comprehensive-guide-to-angular-onpush-change-detection-strategy-5bac493074a4
})
export class MyContainerComponent {}