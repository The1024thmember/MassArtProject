import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HideDirective } from './Hide/hide.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [HideDirective],
  exports: [HideDirective],
})
export class DirectivesModule {}
