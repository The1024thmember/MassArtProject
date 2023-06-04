import { ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BackendModule } from './backend';
import { Datastore } from './datastore';

@NgModule({
  imports: [
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    BackendModule.forRoot(),
  ],
  providers: [Datastore],
})
export class DatastoreModule {
  static initialize(): ModuleWithProviders<DatastoreModule> {
    return {
      ngModule: DatastoreModule,
    };
  }
}
