import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HideDirective } from './Hide/hide.directive';
import { MarginDirective } from './Margin/margin.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [HideDirective, MarginDirective],
  exports: [HideDirective, MarginDirective],
})
export class DirectivesModule {}
