import { Component, OnInit } from '@angular/core';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { Margin } from 'src/app/Directives/Margin/margin.directive';
import { RegisterSocketService } from 'src/app/Services/BackendServices/RegisterSignalRService';

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
    <my-grid>
      <my-col [colDesktopSmall]="5" [colTablet]="12">
        <my-button>Click Me To Send Message (decrepted)</my-button>
      </my-col>
      <my-col [colDesktopSmall]="5" [colTablet]="12">
        <my-button>Click Me To Send News (decrepted)</my-button>
      </my-col>
    </my-grid>
  </my-container>`,
})
export class LandingPageObjectiveComponent implements OnInit {
  HeadingType = HeadingType;
  Margin = Margin;

  constructor(private _registerSocketService: RegisterSocketService) {}

  ngOnInit(): void {}
}
