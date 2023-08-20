import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { BackendModule } from '../../backend';
import { DrawEventsBackend } from './drawEvents.backend';
import { DrawEventsReducer } from './drawEvents.reducer';
@NgModule({
  imports: [
    StoreModule.forFeature('drawEvents', DrawEventsReducer),
    BackendModule.forFeature('drawEvents', DrawEventsBackend),
  ],
})
export class DrawEventsModule {}
