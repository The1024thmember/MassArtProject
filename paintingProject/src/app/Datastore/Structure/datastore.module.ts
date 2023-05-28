import { ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BackendModule } from './backend';
import { Datastore } from './datastore';
import { DatastoreConfig } from './datastore.interface';
import { RequestDataModule } from './request-data.module';

@NgModule({
  imports: [
    RequestDataModule,
    BackendModule.forRoot(),
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
  ],
})
export class DatastoreModule {
  static initialize(
    config: DatastoreConfig
  ): ModuleWithProviders<DatastoreModule> {
    return {
      ngModule: DatastoreModule,
      providers: [
        Datastore,
        {
          provide: DATASTORE_CONFIG,
          useValue: config,
        },
        {
          provide: HTTP_ADAPTER,
          useClass: config.httpAdapter,
        },
        {
          provide: REQUEST_DATA_INITIAL_CONFIG,
          useValue: config.requestData,
        },
      ],
    };
  }
}
