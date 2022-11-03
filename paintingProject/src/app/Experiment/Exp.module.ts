import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ColorSketchModule } from 'ngx-color/sketch';
import { ColorSliderModule } from 'ngx-color/slider';
import { ComponentLibraryModule } from '../ComponentLibrary';
import { DirectivesModule } from '../Directives';
import { MyAsyncPipeModule } from '../Pipes';
import { ExpColorPickerComponent } from './Exp-colorPicker/Exp-colorPicker';
import { ExpColorPlatteComponent } from './Exp-colorPlatte/Exp-colorPlatte';
import { ExpControlsComponent } from './Exp-controls/Exp-controls';
import { ExpToolsComponent } from './Exp-tools/Exp-tools';
import { ExpUserPanelComponent } from './Exp-userPanel/Exp-userPanel';
import { ExpColorWeightComponent } from './Exp-weightPicker/Exp-weightPicker';
import { ExpComponent } from './Exp.component';
import { ExpRoutingModule } from './Exp.routing.module';

@NgModule({
  imports: [
    CommonModule,
    ExpRoutingModule,
    ComponentLibraryModule,
    DirectivesModule,
    ColorSketchModule,
    ColorSliderModule,
    MyAsyncPipeModule,
  ],
  declarations: [
    ExpComponent,
    ExpToolsComponent,
    ExpControlsComponent,
    ExpUserPanelComponent,
    ExpColorPlatteComponent,
    ExpColorPickerComponent,
    ExpColorWeightComponent,
  ],
  exports: [],
  providers: [],
})
export class ExpModule {}
