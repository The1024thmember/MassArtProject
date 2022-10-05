import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComponentLibraryModule } from '../ComponentLibrary';
import { DirectivesModule } from '../Directives';
import { DrawBoardControlsComponent } from './DrawBoardPage-controls/DrawBoardPage-controls';
import { DrawBoardToolsComponent } from './DrawBoardPage-tools/DrawBoardPage-tools';
import { DrawBoardPageComponent } from './DrawBoardPage.component';
import { DrawBoardPageRoutingModule } from './DrawBoardPage.routing.module';

@NgModule({
  imports: [
    CommonModule,
    DrawBoardPageRoutingModule,
    ComponentLibraryModule,
    DirectivesModule,
  ],
  declarations: [
    DrawBoardPageComponent,
    DrawBoardToolsComponent,
    DrawBoardControlsComponent,
  ],
  exports: [],
})
export class DrawBoardPageModule {}
