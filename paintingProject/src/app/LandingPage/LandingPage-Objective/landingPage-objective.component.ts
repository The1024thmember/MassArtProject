import { Component } from "@angular/core";
import { HeadingType } from "src/app/ComponentLibrary/MyHeading";

@Component({
    selector: "landingPage-Objectives",
    template:`<my-container>
        <my-heading [headingType] = 'HeadingType.H1'>"The Art of Togetherness"</my-heading>
    </my-container>`,
})

export class LandingPageObjectiveComponent {
    HeadingType = HeadingType;
}