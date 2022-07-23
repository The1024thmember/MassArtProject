import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ComponentLibraryModule } from "../ComponentLibrary";
import { LandingPageObjectiveComponent } from "./LandingPage-Objective/landingPage-objective.component";
import { LandingPageComponent } from "./landingPage.component";
import { landingPageRoutingModule } from "./landingPage.routing.module";

@NgModule({
    imports:[
        CommonModule,
        landingPageRoutingModule,
        ComponentLibraryModule,
    ],
    declarations:[LandingPageComponent, LandingPageObjectiveComponent],
    exports:[],
})
export class landingPageModule {}