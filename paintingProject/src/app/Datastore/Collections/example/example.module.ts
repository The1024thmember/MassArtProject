import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { BackendModule } from '../../Structure/backend';
import { exampleBackend } from './example.backend';
import { ExampleReducer } from './example.reducer';

@NgModule({
  imports: [
    StoreModule.forFeature('example', ExampleReducer),
    BackendModule.forFeature('example', exampleBackend),
  ],
})
export class DatastoreExampleModule {}
