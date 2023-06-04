import { HttpClient } from '@angular/common/http';
import {
  Inject,
  Injectable,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map, of, switchMap, withLatestFrom } from 'rxjs';

@Injectable()
export class StoreBackend implements BackEndInterface {
  private backendConfigs: any = {};
  private baseUrl = 'https://api.publicapis.org';
  constructor(
    private store$: Store<any>,
    private http: HttpClient //@Inject(DATASTORE_CONFIG) private datastoreConfig: DatastoreConfig,
  ) {}

  addFeature(collectionName: string, requestFactory: any): void {
    this.backendConfigs[collectionName] = requestFactory;
  }

  isFeatureLoaded(collection: any): boolean {
    return collection in this.backendConfigs;
  }

  fetch(ref: any): Observable<any> {
    const { authUid, params, collection, query } = ref;
    return of(this.backendConfigs[collection]).pipe(
      map((config) => {
        if (!config) {
          throw new Error();
        }
        return config.fetch;
      }),
      map((fetch: any) => {
        return fetch(authUid, params, query); // this is the fetch
      }),
      switchMap((request) => {
        const actualRequest = `${this.baseUrl}/${request.endpoint}`;
        const body = {
          params,
        };
        return this.http.get(actualRequest, body);
      })
    );
  }

  update(ref: any, id: number | string, delta: any): Observable<any> {
    const { authUid, params, collection, query } = ref;
    return of(this.backendConfigs[collection]).pipe(
      map((config) => {
        if (!config) {
          throw new Error();
        }
        return config.update;
      }),
      withLatestFrom(this.store$),
      map(([update, storeState]) => {
        const originalDocument = {
          storeState,
          collection,
          id,
        };

        if (originalDocument === undefined) {
          throw new Error('Missing original document');
        }
        const request = update(authUid, delta, originalDocument);
        return {
          request,
          payload: {
            collection,
            ref,
            delta,
            rawPayload: request.payload,
            originalDocument,
          },
        };
      }),
      switchMap(({ request, payload }) => {
        // return this.http
        //   .post(request.endpoint, payload.rawPayload, payload.ref.param)
        //   .pipe(map((result) => ({ payload, result })));

        // Mocking the update response here
        return of(delta).pipe(
          map((result) => ({
            payload,
            result: {
              result,
              status: 'success',
            },
          }))
        );
      }),
      map(({ payload, result }) => {
        return this.sendActions(
          { type: 'UPDATE', payload },
          payload.ref.params,
          payload.ref.query,
          result
        );
      })
    );
  }

  delete(ref: any): Observable<any> {
    const { path } = ref;
    const type = path.collectionName;
    return of(this.backendConfigs[type]).pipe();
  }

  push(ref: any): Observable<any> {
    const { path } = ref;
    const type = path.collectionName;
    return of(this.backendConfigs[type]).pipe();
  }

  private sendActions(
    baseAction: any,
    id: string | number,
    query: any,
    data: any
  ): any {
    switch (data.status) {
      case 'success': {
        const action: any =
          baseAction.type === 'PUSH'
            ? ({
                type: 'API_PUSH_SUCCESS',
                payload: {
                  collection: baseAction.payload.collection,
                  id: id,
                  result: data.result,
                },
              } as any)
            : baseAction.type === 'SET'
            ? ({
                type: 'API_SET_SUCCESS',
                payload: {
                  collection: baseAction.payload.collection,
                  id: id,
                  result: data.result,
                },
              } as any)
            : baseAction.type === 'UPDATE'
            ? ({
                type: 'API_UPDATE_SUCCESS',
                payload: {
                  collection: baseAction.payload.collection,
                  id: id,
                  result: data.result,
                },
              } as any)
            : ({
                type: 'API_DELETE_SUCCESS',
                payload: {
                  collection: baseAction.payload.collection,
                  id: id,
                  result: data.result,
                },
              } as any);
        this.store$.dispatch(action);
        return baseAction.type === 'PUSH'
          ? {
              status: 'success',
              id: (data.result as any)?.id,
            }
          : { status: 'success' };
      }
      default: {
        const action: any =
          baseAction.type === 'PUSH'
            ? {
                type: 'API_PUSH_ERROR',
                payload: baseAction.payload,
              }
            : baseAction.type === 'SET'
            ? {
                type: 'API_SET_ERROR',
                payload: baseAction.payload,
              }
            : baseAction.type === 'UPDATE'
            ? {
                type: 'API_UPDATE_ERROR',
                payload: baseAction.payload,
              }
            : {
                type: 'API_DELETE_ERROR',
                payload: baseAction.payload,
              };
        this.store$.dispatch(action);
        return data;
      }
    }
  }
}

@NgModule({})
export class BackendRootModule {}

export const BACKEND_COLLECTIONS =
  new InjectionToken<BackendCollectionsProvider>('Backend Collections');

export const BACKEND_CONFIGS = new InjectionToken<BackendConfigsProvider>(
  'Backend Configs'
);

export type BackendCollectionsProvider = readonly any[];
export type BackendConfigsProvider = readonly any[];

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

export interface BackEndInterface {
  push(ref: any): Observable<any>;
  update(ref: any, id: number | string, delta: any): Observable<any>;
  delete(ref: any): Observable<any>;
}

@NgModule({})
export class BackendModule {
  static forRoot(): ModuleWithProviders<BackendRootModule> {
    return {
      ngModule: BackendRootModule,
      providers: [StoreBackend],
    };
  }

  static forFeature(
    collectionName: any,
    configFactory: any
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
