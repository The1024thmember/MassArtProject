import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentLibraryModule } from '../ComponentLibrary';
import { DirectivesModule } from '../Directives';
import { LandingPageObjectiveComponent } from './LandingPage-Objective/landingPage-objective.component';
import { LandingPageComponent } from './landingPage.component';
import { LandingPageRoutingModule } from './landingPage.routing.module';

@NgModule({
  imports: [
    CommonModule,
    LandingPageRoutingModule,
    ComponentLibraryModule,
    DirectivesModule,
  ],
  declarations: [LandingPageComponent, LandingPageObjectiveComponent],
  exports: [],
  providers: [HttpClientModule],
})
export class LandingPageModule {}
