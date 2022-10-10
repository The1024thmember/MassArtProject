import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComponentLibraryModule } from '../ComponentLibrary';
import { DirectivesModule } from '../Directives';
import { DrawBoardColorPickerComponent } from './DrawBoardPage-colorPicker/DrawBoardPage-colorPicker';
import { DrawBoardColorPlatteComponent } from './DrawBoardPage-colorPlatte/DrawBoardPage-colorPlatte';
import { DrawBoardControlsComponent } from './DrawBoardPage-controls/DrawBoardPage-controls';
import { DrawBoardToolsComponent } from './DrawBoardPage-tools/DrawBoardPage-tools';
import { DrawBoardUserPanelComponent } from './DrawBoardPage-userPanel/DrawBoardPage-userPanel';
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
    DrawBoardUserPanelComponent,
    DrawBoardColorPlatteComponent,
    DrawBoardColorPickerComponent,
  ],
  exports: [],
})
export class DrawBoardPageModule {}
