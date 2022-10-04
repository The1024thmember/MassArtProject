import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MarginDirective } from './margin.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [MarginDirective],
  exports: [MarginDirective],
})
export class MarginModule {}
