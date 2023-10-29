import { HttpClient } from '@angular/common/http';
import {
  Inject,
  Injectable,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, delay, map, of, switchMap, withLatestFrom } from 'rxjs';
import { DatastoreConfig } from 'src/environments/environment.types';
import { DATASTORE_CONFIG } from './datastore.config';

@Injectable()
export class StoreBackend implements BackEndInterface {
  private backendConfigs: any = {};
  private baseUrl = 'https://api.publicapis.org';
  constructor(
    private store$: Store<any>,
    private http: HttpClient,
    @Inject(DATASTORE_CONFIG) private datastoreConfig: DatastoreConfig
  ) {
    // need to remove this
    localStorage.setItem('id', '0');
  }

  addFeature(collectionName: string, requestFactory: any): void {
    console.error('added to datastore collectionName:', collectionName);
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
          throw new Error('Fetch error');
        }
        return config.fetch;
      }),
      map((fetch: any) => {
        return fetch(authUid, params, query); // this is the fetch
      }),
      switchMap((request) => {
        const actualRequest = `${this.datastoreConfig.RESTAPIUrl}/${request.endpoint}`;
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
          throw new Error('Update error');
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

  delete(ref: any, id: number | string): Observable<any> {
    const { authUid, path, collection } = ref;
    return of(this.backendConfigs[collection]).pipe(
      map((config) => {
        if (!config) {
          throw new Error('Delete error');
        }
        return config.delete;
      }),
      map((set) => set),
      withLatestFrom(this.store$),
      map(([del, storeState]) => {
        const originalDocument = pluckDocumentFromRawStore(
          storeState,
          collection,
          authUid,
          id
        );
        if (originalDocument === undefined) {
          throw new Error('Delete error: missing original document');
        }
        const request = del(authUid, id, originalDocument);
        return {
          request,
          payload: {
            collection,
            ref,
            rawRequest: request.payload,
            originalDocument,
          },
        };
      }),
      // We want the Datastore actions to be asynchronous, as updating an
      // object on rendering is a legitimate use case (e.g. mark as read), and
      // the actions results being synchronous would trigger
      // "ExpressionChangedAfterItHasBeenChecked" errors
      delay(0),
      switchMap(({ request, payload }) => {
        // return this.http
        //   .delete(request)
        //   .pipe(map((result) => ({ payload, result })));

        // Mocking the update response here
        return of({}).pipe(
          //the {} is the result after deletion
          map((result) => ({
            payload,
            result: {
              result,
              status: 'success',
            },
          }))
        );
      }),
      map(({ payload, result }) =>
        this.sendActions(
          { type: 'DELETE', payload },
          id,
          payload.ref.query,
          result
        )
      )
    );
  }

  push(
    ref: any,
    document: any,
    extra?: { readonly [index: string]: string | number }
  ): Observable<any> {
    const { authUid, path, collection } = ref;
    return of(this.backendConfigs[collection]).pipe(
      map((config) => {
        if (!config) {
          throw new Error('Push error');
        }
        return config.push;
      }),
      map((push) => {
        const request = push(authUid, document, extra);
        return {
          request,
          payload: {
            ref,
            collection,
            document,
            rawRequest: request.payload,
          },
        };
      }),
      // We want the Datastore actions to be asynchronous, as updating an
      // object on rendering is a legitimate use case (e.g. mark as read), and
      // the actions results being synchronous would trigger
      // "ExpressionChangedAfterItHasBeenChecked" errors
      delay(0),
      switchMap(({ request, payload }) => {
        const actualRequest = `${this.datastoreConfig.RESTAPIUrl}/${request.endpoint}`;
        const body = {
          payload,
        };
        // return this.http
        //   .post(actualRequest, body)
        //   .pipe(map((result) => ({ payload, result })));

        // Mock backend returned result:
        const fakeId = parseInt(localStorage.getItem('id') ?? '0') + 1;
        localStorage.setItem('id', fakeId.toString());
        return of({ id: fakeId }).pipe(
          map((result) => ({
            payload,
            result: {
              id: result.id,
              status: 'success',
              result: 'Test Post Value',
            },
          }))
        );
      }),
      map(({ payload, result }) =>
        this.sendActions(
          { type: 'PUSH', payload },
          result.id,
          payload.ref.query,
          result
        )
      )
    );
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
                  id: id, //hard coded, need to change based on request response
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
    console.error('backendCollections:', backendCollections);
    backendCollections.map((collectionName, index) => {
      storeBackend.addFeature(collectionName, backendConfigs[index]);
    });
  }
}

export interface BackEndInterface {
  push(
    ref: any,
    document: any,
    extra?: { readonly [index: string]: string | number }
  ): Observable<any>;
  update(ref: any, id: number | string, delta: any): Observable<any>;
  delete(ref: any, id: number | string): Observable<any>;
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

export function pluckDocumentFromRawStore(
  store: any,
  collection: any,
  authUid: any,
  id: string | number
): any {
  //const slice = store[collection][authUid]; //currently not implmented auth id yet
  const slice = store[collection];
  console.log('slice:', slice);
  return slice && slice[id] ? slice[id] : undefined;
}
