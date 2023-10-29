import {
  GoogleSigninButtonModule,
  SocialLoginModule,
} from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { ComponentLibraryModule } from '../ComponentLibrary';
import { DrawEventsModule, ExampleModule } from '../Datastore/Resource';
import { DirectivesModule } from '../Directives';
import { SignUpModalModule } from '../Modals/SignUpModal/signup-modal.module';
import { LandingPageObjectiveComponent } from './LandingPage-Objective/landingPage-objective.component';
import { GoogleLoginComponent } from './LandingPage-SignIn/LandingPage-SignIn.component';
import { DatastoreExampleComponent } from './datastore-example/datastore-example';
import { LandingPageComponent } from './landingPage.component';
import { LandingPageRoutingModule } from './landingPage.routing.module';

@NgModule({
  imports: [
    SocialLoginModule,
    CommonModule,
    MatDialogModule,
    LandingPageRoutingModule,
    ComponentLibraryModule,
    DirectivesModule,
    GoogleSigninButtonModule,
    ExampleModule,
    DrawEventsModule,
    SignUpModalModule,
  ],
  declarations: [
    LandingPageComponent,
    LandingPageObjectiveComponent,
    GoogleLoginComponent,
    DatastoreExampleComponent,
  ],
  exports: [],
  providers: [HttpClientModule],
})
export class LandingPageModule {}
