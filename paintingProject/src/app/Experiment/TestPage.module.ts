import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComponentLibraryModule } from '../ComponentLibrary';
import { TestPageComponent } from './TestPage.component';
import { TestPageRoutingModule } from './TestPage.routing.module';

@NgModule({
  imports: [CommonModule, TestPageRoutingModule, ComponentLibraryModule],
  declarations: [TestPageComponent],
  exports: [],
})
export class TestPageModule {
  constructor() {
    console.log('initiating test moudle');
  }
}
