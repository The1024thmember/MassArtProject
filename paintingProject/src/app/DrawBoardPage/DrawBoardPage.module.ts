import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComponentLibraryModule } from '../ComponentLibrary';
import { DrawBoardToolsComponent } from './DrawBoardPage-tools/DrawBoardPage-tools';
import { DrawBoardPageComponent } from './DrawBoardPage.component';
import { DrawBoardPageRoutingModule } from './DrawBoardPage.routing.module';

@NgModule({
  imports: [CommonModule, DrawBoardPageRoutingModule, ComponentLibraryModule],
  declarations: [DrawBoardPageComponent, DrawBoardToolsComponent],
  exports: [],
})
export class DrawBoardPageModule {}
