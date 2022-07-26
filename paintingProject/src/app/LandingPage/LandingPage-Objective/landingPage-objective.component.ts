import { Component } from "@angular/core";
import { HeadingType } from "src/app/ComponentLibrary/MyHeading";

@Component({
    selector: "landingPage-Objectives",
    template:`
    <my-container>
        <my-grid>
            <my-col [col]="8">
                <my-heading [headingType] = 'HeadingType.H1'>"The Art of Togetherness"</my-heading>
            </my-col>
            <my-col [col]="2">
                <my-heading [headingType] = 'HeadingType.H1'>"2"</my-heading>
            </my-col>
        </my-grid>
    </my-container>`,
})

export class LandingPageObjectiveComponent {
    HeadingType = HeadingType;
}