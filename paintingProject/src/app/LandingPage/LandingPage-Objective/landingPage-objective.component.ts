import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { Margin } from 'src/app/Directives/Margin/margin.directive';
import { SignupModalComponent } from 'src/app/Modals/SignUpModal/signup-modal.component';

@Component({
  selector: 'landingPage-Objectives',
  template: ` <my-container>
    <my-grid>
      <my-col [colDesktopSmall]="6">
        <my-heading [headingType]="HeadingType.H1">
          The Art of Togetherness
        </my-heading>
      </my-col>
      <my-col [colDesktopSmall]="5" [colTablet]="12">
        <my-heading [headingType]="HeadingType.H1">2</my-heading>
      </my-col>
    </my-grid>
    <!-- <app-google-login></app-google-login> -->
    <my-button (click)="OpenSignInModal()">Participate</my-button>
    <hr />
    <hr />
    <datastore-example></datastore-example>
  </my-container>`,
})
export class LandingPageObjectiveComponent implements OnInit {
  HeadingType = HeadingType;
  Margin = Margin;

  constructor(public matDialog: MatDialog) {}

  ngOnInit(): void {}

  OpenSignInModal() {
    console.log('open signin modal');
    const dialogConfig = new MatDialogConfig();
    // The user can't close the dialog by clicking outside its body
    dialogConfig.disableClose = true;
    dialogConfig.id = 'modal-component';
    dialogConfig.height = '350px';
    dialogConfig.width = '600px';
    // https://material.angular.io/components/dialog/overview
    const modalDialog = this.matDialog.open(SignupModalComponent, dialogConfig);
  }
}
