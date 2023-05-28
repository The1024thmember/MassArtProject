// Called by request-data.effect.ts for fetch() function to fetch data via API
// Called by datastore.ts for update(),set(),delete() function, and emits API_UPDATE_SUCCESS or
// API_UPDATE_ERROR action.

import { Inject, Injectable, InjectionToken, NgModule } from '@angular/core';
import { Observable, filter, map, of, switchMap } from 'rxjs';
import { isDefined } from 'src/app/Helpers';
import { ResponseData } from 'src/app/Services/BackendServices/HttpsService/Https.interface';
import { MyHttp } from 'src/app/Services/BackendServices/HttpsService/Https.service';
import { StoreBackendInterface } from './backend.interface';
import {
  DatastoreCollectionType,
  DatastoreDeleteCollectionType,
  DatastoreFetchCollectionType,
  DatastorePushCollectionType,
  DatastoreSetCollectionType,
  DatastoreUpdateCollectionType,
  Reference,
} from './store.model';

// Defines BackendModule, which makes provides entry point for collection.backent.ts file
export type BackendConfigs = { [K in string]?: Backend<any> };

/**
 * This type is strange as it seeks to enforce that the backend factory
 * implements each method if and only iff it is specified in the collection
 * type. If not you need to specify `undefined`.
 *
 * The `C['Backend']['Fetch'] extends never` is needed to check if it's actually
 * there, and the `C extends DatastoreFetchCollectionType` is necessary to let
 * TypeScript know it is there. Not sure why we need both :(
 */
type FetchRequestFactory<
  C extends DatastoreCollectionType & DatastoreFetchCollectionType
> = (
  authUid: string,
  /** The document IDs passed to a `datastore.document` call */
  ids: readonly string[] | undefined,
  /** The query passed to a `datastore.collection` call or `document` call by secondary ID */
  // query: RawQuery<C['DocumentType']> | undefined,
  order: Ordering<C> | undefined
  // resourceGroup: C['ResourceGroup'] | undefined
) => BackendFetchRequest<C>;

type PushRequestFactory<
  C extends DatastoreCollectionType & DatastorePushCollectionType
> = (
  authUid: string,
  document: PushDocumentType<C>,
  extra: { readonly [index: string]: string | number } | undefined
) => BackendPushRequest<C>;

type SetRequestFactory<
  C extends DatastoreCollectionType & DatastoreSetCollectionType
> = (authUid: string, document: SetDocumentType<C>) => BackendSetRequest<C>;

type UpdateRequestFactory<
  C extends DatastoreCollectionType & DatastoreUpdateCollectionType
> = (
  authUid: string,
  delta: RecursivePartial<C['DocumentType']>,
  originalDocument: C['DocumentType']
) => BackendUpdateRequest<C>;

type DeleteRequestFactory<
  C extends DatastoreCollectionType & DatastoreDeleteCollectionType
> = (
  authUid: string,
  id: string | number,
  originalDocument: C['DocumentType']
) => BackendDeleteRequest<C>;

export interface Backend<C extends DatastoreCollectionType> {
  readonly fetch: C['Backend']['Fetch'] extends never
    ? undefined
    : C extends DatastoreFetchCollectionType
    ? FetchRequestFactory<C>
    : undefined;

  readonly push: C['Backend']['Push'] extends never
    ? undefined
    : C extends DatastorePushCollectionType
    ? PushRequestFactory<C>
    : undefined;

  readonly set: C['Backend']['Set'] extends never
    ? undefined
    : C extends DatastoreSetCollectionType
    ? SetRequestFactory<C>
    : undefined;

  readonly update: C['Backend']['Update'] extends never
    ? undefined
    : C extends DatastoreUpdateCollectionType
    ? UpdateRequestFactory<C>
    : undefined;

  readonly remove: C['Backend']['Delete'] extends never
    ? undefined
    : C extends DatastoreDeleteCollectionType
    ? DeleteRequestFactory<C>
    : undefined;

  /** Can you subscribe to these events from the websocket? */
  readonly isSubscribable?: true;
}
@Injectable()
export class StoreBackend implements StoreBackendInterface {
  private backendConfigs: BackendConfigs = {};
  constructor(private myHttp: MyHttp) {}
  defaultOrder<C extends DatastoreCollectionType>(collection: C['Name']) {
    throw new Error('Method not implemented.');
  }
  push<C extends DatastoreCollectionType & DatastorePushCollectionType>(
    ref: Reference<C>,
    document: PushDocumentType<C>,
    extra?: { readonly [index: string]: string | number } | undefined
  ): Observable<BackendPushResponse<C>> {
    throw new Error('Method not implemented.');
  }
  set<C extends DatastoreCollectionType & DatastoreSetCollectionType>(
    ref: Reference<C>,
    id: string | number,
    document: SetDocumentType<C>
  ): Observable<BackendSetResponse<C>> {
    throw new Error('Method not implemented.');
  }
  update<C extends DatastoreCollectionType & DatastoreUpdateCollectionType>(
    ref: Reference<C>,
    id: string | number,
    delta: C['DocumentType']
  ): Observable<BackendUpdateResponse<C>> {
    throw new Error('Method not implemented.');
  }
  delete<C extends DatastoreCollectionType & DatastoreDeleteCollectionType>(
    ref: Reference<C>,
    id: string | number
  ): Observable<BackendDeleteResponse<C>> {
    throw new Error('Method not implemented.');
  }

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

  /**
   * Checks if the backend config (*.backend.ts) for a given collection is available.
   * It is only available if the BackendFeatureModule (or DatastoreFeatureModule)
   * for that collection has been imported.
   *
   * Note that this does not check if the @ngrx/store feature module for that
   * collection has been imported. This is only possible when we have access to
   * store state, i.e. upon subscription to the store. However, since the both
   * the store and backend feature modules are imported together in the various
   * `DatastoreXModule` modules, checking one of these is equivalent to checking
   * the other.
   */
  isFeatureLoaded<C extends DatastoreCollectionType>(
    collection: any // FIXME: T267853 -
  ): boolean {
    return collection in this.backendConfigs;
  }

  addFeature<C extends DatastoreCollectionType>(
    collectionName: any, // FIXME: T267853 -
    requestFactory: BackendConfigs[any] // FIXME: T267853 -
  ): void {
    this.backendConfigs[collectionName] = requestFactory;
  }

  isSubscribable<C extends DatastoreCollectionType>(
    collectionName: C['Name']
  ): boolean {
    const config = this.backendConfigs[collectionName];
    return (config && config.isSubscribable) || false;
  }
}

export const BACKEND_COLLECTIONS =
  new InjectionToken<BackendCollectionsProvider>('Backend Collections');

export const BACKEND_CONFIGS = new InjectionToken<BackendConfigsProvider>(
  'Backend Configs'
);

type BackendConfigFactory<C extends DatastoreCollectionType> = () => Backend<C>;

export type BackendCollectionsProvider = readonly any[]; // FIXME: T267853 -
export type BackendConfigsProvider = readonly Backend<any>[]; // FIXME: T267853 -

@NgModule({})
export class BackendRootModule {}

@NgModule({})
export class BackendFeatureModule {
  constructor(
    storeBackend: StoreBackend,
    @Inject(BACKEND_COLLECTIONS) backendCollections: BackendCollectionsProvider,
    @Inject(BACKEND_CONFIGS) backendConfigs: BackendConfigsProvider
  ) {
    backendCollections.map((collectionName, index) => {
      storeBackend.addFeature(collectionName, backendConfigs[index]);
    });
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
