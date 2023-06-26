import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { BackendModule } from '../../backend';
import { ExampleBackend } from './example.backend';
import { ExampleReducer } from './example.reducer';
@NgModule({
  imports: [
    StoreModule.forFeature('example', ExampleReducer),
    BackendModule.forFeature('example', ExampleBackend),
  ],
})
export class ExampleModule {}
