// Called by request-data.effect.ts for fetch() function to fetch data via API
// Called by datastore.ts for update(),set(),delete() function, and emits API_UPDATE_SUCCESS or
// API_UPDATE_ERROR action.

import { Injectable, NgModule } from '@angular/core';
import { Observable, filter, map, switchMap } from 'rxjs';
import { isDefined } from 'src/app/Helpers';
import { ResponseData } from 'src/app/Services/BackendServices/HttpsService/Https.interface';
import { MyHttp } from 'src/app/Services/BackendServices/HttpsService/Https.service';
import { StoreBackendInterface } from './backend.interface';
import {
  DatastoreCollectionType,
  DatastoreFetchCollectionType,
  Reference,
} from './store.model';

// Defines BackendModule, which makes provides entry point for collection.backent.ts file
@Injectable()
export class StoreBackend implements StoreBackendInterface {
  constructor(private myHttp: MyHttp) {}

  fetch<C extends DatastoreCollectionType & DatastoreFetchCollectionType>(
    ref: Reference<C>
  ): Observable<fetchReponse<C>> {
    const { path } = ref;
    const type = path.collection;
    return of(this.backendConfigs[type]).pipe(
      map((config) => {
        if (!config) {
          throw new DatastoreMissingModuleError(type);
        }
        return config.fetch;
      }),
      filter(isDefined),
      map((fetch: FetchRequestFactory<C>) => fetch(path.authUid, path.ids)),
      switchMap((request) => {
        const actualRequest = {
          ...request,
          params: {
            ...request.params,
          },
          // Don't throw errors when a fetch fails with NOT_FOUND.
          // This is generally expected and not cause for an exception.
          errorWhitelist: ['NOT_FOUND'],
        };
        return this.myHttp.get(actualRequest);
      })
    );
  }
}

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

export type fetchReponse<
  C extends DatastoreCollectionType & DatastoreFetchCollectionType
> = ResponseData<
  C['Backend']['Fetch']['ReturnType'],
  C['Backend']['Fetch']['ErrorType']
>;
