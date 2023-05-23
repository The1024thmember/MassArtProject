// Called by request-data.effect.ts for fetch() function to fetch data via API
// Called by datastore.ts for update(),set(),delete() function, and emits API_UPDATE_SUCCESS or
// API_UPDATE_ERROR action.

import { StoreBackendInterface } from './backend.interface';

// Defines BackendModule, which makes provides entry point for collection.backent.ts file
@Injectable()
export class StoreBackend implements StoreBackendInterface {}

@NgModule({})
export class BackendModule {
  static forRoot(): ModuleWithProviders<BackendRootModule> {
    return {
      ngModule: BackendRootModule,
      providers: [StoreBackend],
    };
  }

  static forFeature<C extends DatastoreCollectionType>(
    collectionName: C['Name'],
    configFactory: BackendConfigFactory<C>
  ): ModuleWithProviders<BackendFeatureModule> {
    return {
      ngModule: BackendFeatureModule,
      providers: [
        {
          provide: BACKEND_COLLECTIONS,
          multi: true,
          useValue: collectionName,
        },
        {
          provide: BACKEND_CONFIGS,
          multi: true,
          useFactory: configFactory,
        },
      ],
    };
  }
}
