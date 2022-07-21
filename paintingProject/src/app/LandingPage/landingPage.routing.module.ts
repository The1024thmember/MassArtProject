import { NgModule } from "@angular/core";
import { LandingPageComponent } from "./landingPage.component";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
    },
];

@NgModule({
    imports:[
       RouterModule.forChild(routes)
    ],
    exports:[RouterModule],
})
export class landingPageRoutingModule {}