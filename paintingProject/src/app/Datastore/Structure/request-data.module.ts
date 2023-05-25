import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { RequestDataEffect } from './request-data.effect';

@NgModule({
  imports: [EffectsModule.forFeature([RequestDataEffect])],
})
export class RequestDataModule {}
