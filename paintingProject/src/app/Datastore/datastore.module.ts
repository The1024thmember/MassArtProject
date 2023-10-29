import { ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DatastoreConfig } from 'src/environments/environment.types';
import { BackendModule } from './backend';
import { Datastore } from './datastore';
import { DATASTORE_CONFIG } from './datastore.config';

@NgModule({
  imports: [
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    BackendModule.forRoot(),
  ],
  providers: [Datastore],
})
export class DatastoreModule {
  static initialize(
    config: DatastoreConfig
  ): ModuleWithProviders<DatastoreModule> {
    return {
      ngModule: DatastoreModule,
      providers: [
        {
          provide: DATASTORE_CONFIG,
          useValue: config,
        },
      ],
    };
  }
}
