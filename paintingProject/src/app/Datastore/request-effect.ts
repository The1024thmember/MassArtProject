import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { Observable, filter, map, switchMap, tap } from 'rxjs';
import { StoreBackend } from './backend';
@Injectable()
export class RequestDataEffect {
  //private baseUrl = 'https://api.publicapis.org';
  // private count = 0;
  readonly requestData$: Observable<any>;
  constructor(
    private actions$: Actions<any>,
    private stroreBackend: StoreBackend
  ) {
    const response$ = this.actions$.pipe(
      tap((action) => console.log('action:', action)),
      filter((action) => action.type === 'REQUEST_DATA'),
      map((action) => action.payload),
      switchMap((request) => {
        // return this.http
        //   .get(`${this.baseUrl}/${request.endpoint}`, {
        //     // here the get function and endpoint is coming from the params in *backend.ts
        //     observe: 'response',
        //     params: request.params, // this is coming from the previous emitted action payload param, indicating the id of the object eg: user id
        //   })
        return this.stroreBackend.fetch(request).pipe(
          map((response) => {
            // here mocking the response from the BE
            const res = {
              request: {
                collection: request.collection,
                id: request.params,
              },
              response: 'inital value', // just mocking, replace the real response from API to string for easy display
            };
            return res; // this returned result is going to be passing to datastore collection, so the info should contain the data and the collectionName & id
          })
        );
      })
    );

    this.requestData$ = createEffect(() =>
      response$.pipe(
        map(({ request, response }) => {
          return this.dispatchResponseAction(request, response);
        })
      )
    );
  }

  private dispatchResponseAction(request: any, response: any) {
    return {
      type: 'API_FETCH_RESULT',
      payload: {
        result: response,
        id: request.id,
        collection: request.collection,
      },
    };
  }
}
