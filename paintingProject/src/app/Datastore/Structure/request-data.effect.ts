// Defines the effect, when the action emits, what logic to do for handling that action.
// This is where the data fetching via api happened, it emits the API_FETCH_SUCCESS or
// API_FETCH_ERROR action for updating datastore data accordingly.
import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { Observable, filter, map, switchMap } from 'rxjs';
import { ResponseData } from 'src/app/Services/BackendServices';
import type { ApiFetchResponse } from '../../Services/BackendServices';
import type {
  CollectionActions,
  RequestDataPayload,
  TypedAction,
} from './actions';
import { isRequestDataAction } from './actions';
import { StoreBackend } from './backend';
import { DatastoreCollectionType } from './store.model';

interface RequestAndResponse<C extends DatastoreCollectionType, E> {
  readonly request: RequestDataPayload<C>;
  readonly response: ResponseData<any, E>;
}

@Injectable()
export class RequestDataEffect {
  readonly requestData$: Observable<TypedAction>;
  constructor(
    private storeBackend: StoreBackend,
    private actions$: Actions<TypedAction>
  ) {
    const response$: Observable<
      readonly RequestAndResponse<DatastoreCollectionType, any>[]
    > = this.actions$.pipe(
      filter(isRequestDataAction),
      map((action) => action.payload),
      switchMap((request) =>
        this.storeBackend.fetch(request.ref).pipe(
          map((response) => {
            return {
              response,
              request,
            } as unknown as RequestAndResponse<DatastoreCollectionType, any>[];
          })
        )
      )
    );

    this.requestData$ = createEffect(() => {
      response$.pipe(
        map((requests) =>
          requests.map(({ response, request }) => {
            this.dispatchResponseAction(response, request);
          })
        )
      );
    });
  }

  private dispatchResponseAction(
    response: ApiFetchResponse<any>,
    request: RequestDataPayload<any>
  ): CollectionActions<any> {
    switch (response.status) {
      case 'success': {
        const action: TypedAction = {
          type: 'API_FETCH_SUCCESS',
          payload: {
            type: request.ref.path.collection,
            result: response.result,
            ref: request.ref,
          },
        };
        return action;
      }
      default: {
        const action: TypedAction = {
          type: 'API_FETCH_ERROR',
          payload: {
            type: request.ref.path.collection,
            ref: request.ref,
          },
        };
        return action;
      }
    }
  }
}
