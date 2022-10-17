import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ColorSketchModule } from 'ngx-color/sketch';
import { ColorSliderModule } from 'ngx-color/slider';
import { ComponentLibraryModule } from '../ComponentLibrary';
import { DirectivesModule } from '../Directives';
import { CanvasDragAndDropService } from '../Services/CanvasDragAndDrop/canvasDragAndDrop.service';
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
    ColorSketchModule,
    ColorSliderModule,
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
  providers: [CanvasDragAndDropService],
})
export class DrawBoardPageModule {}
