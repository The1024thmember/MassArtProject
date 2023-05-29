// This is layer that exposed to FE for making API requests, when instantiate DataStore<Collection>() or
// DataStore<Document>() object, a REQUEST_DATA action is dispatched, request-data.effect.ts will listen
// to that action and call fetch() function in backend.ts for data and store in Datastore. On instantiating
// the Document or Collection object, it also uses store$.select() to get the current data from store, so
// Document or Collection are directly used as data in FE.
import { ApplicationRef, Injectable, OnDestroy } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import {
  Observable,
  Subscription,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  take,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs';
import { isDefined, toObservable } from 'src/app/Helpers';
import { Auth } from 'src/app/Services/BackendServices';
import { TypedAction } from './actions';
import { StoreBackend } from './backend';
import { DatastoreDocument } from './datastore-document';
import { LOGGED_OUT_KEY } from './datastore.interface';
import { DatastoreMissingModuleError } from './missing-module-error';
import { DatastoreCollectionType, Reference, StoreState } from './store.model';
@Injectable()
export class Datastore implements OnDestroy {
  private isInitiallyStable$: Observable<boolean>;
  private subscriptions = new Subscription();

  constructor(
    private store$: Store<StoreState>,
    private action$: Actions<TypedAction>,
    private storeBackend: StoreBackend,
    // private webSocketService: WebSocketService,
    private auth: Auth,
    private appRef: ApplicationRef
  ) {
    // This takes values until the first true, emitting the true
    this.isInitiallyStable$ = this.appRef.isStable.pipe(
      takeWhile((val) => !val, true),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    // We need to make this observable hot so we get the initial version rather
    // than the current version when we subscribe in the code afterwards.
    this.subscriptions.add(this.isInitiallyStable$.subscribe());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Returns a single document from a collection specified by id.
   * If `documentId` is an observable, new documents may be fetched from the
   * network and emitted as they arrive. Note that if it emits too quickly,
   * such that the network request has not completed before the id changes,
   * that document with the previous id will not be emitted.
   *
   * @param collectionName Collection name
   * @param documentId$ If not provided, defaults to the first document of the collection.
   * Omitting this is useful for logged-out requests when document ID is not applicable
   * @param query Only required if querying by a unique secondary ID
   */
  document<C extends DatastoreCollectionType>(
    collectionName: C['Name'],
    documentId$?: string | number | Observable<string> | Observable<number>
  ): DatastoreDocument<C>;
  document<
    C extends DatastoreCollectionType,
    OtherId extends keyof C['DocumentType']
  >(
    collectionName: C['Name'],
    documentId$?: string | number | Observable<string> | Observable<number>
  ): DatastoreDocument<C> {
    const refStream$: Observable<Reference<C>> = combineLatest([
      toObservable(collectionName),
      toObservable(this.auth.authState$),
      toObservable<number | string | undefined>(documentId$).pipe(
        distinctUntilChanged()
      ),
    ]).pipe(
      map(([collection, authState, id]) => {
        const path = {
          collection,
          authUid: authState ? authState.userId : LOGGED_OUT_KEY,
        };

        if (!id) {
          // Treat as a document query with no params
          return {
            path,
            query: {
              isDocumentQuery: true,
              limit: 1,
              queryParams: {},
              searchQueryParams: {},
            },
          };
        }

        return {
          path: { ...path, ids: [id.toString()] },
        };
      })
    );

    const requestStream$ = combineLatest([refStream$]).pipe(
      withLatestFrom(this.isInitiallyStable$),
      switchMap(([[ref], appIsStable]) =>
        // We need store slice here to get current document
        this.store$.pipe(
          select(
            collectionName,
            ref.path.authUid ? ref.path.authUid : LOGGED_OUT_KEY
          ),
          take(1),
          map((store) => ({
            appIsStable,
            currentDocument: ref.path.ids
              ? store?.documents[ref.path.ids[0]]
              : undefined,
            request: {
              type: ref.path.collection,
              ref,
              clientRequestIds: [this.generateClientRequestId()],
            },
          }))
        )
      ),
      tap(({ appIsStable, currentDocument, request }) => {
        if (!this.storeBackend.isFeatureLoaded(collectionName)) {
          throw new DatastoreMissingModuleError(collectionName);
        }

        const action = {
          type: 'REQUEST_DATA',
          payload: request,
        };

        // Only dispatch request if either:
        // - App is already stable
        // - Data is not in store
        if (appIsStable || !currentDocument) {
          this.store$.dispatch(action);
        }
      }),
      map(({ request }) => request),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    const sourceStream$ = requestStream$.pipe(
      // Subscribe to the output of `subscribeToIds()` while `sourceStream$` is subscribed to
      withLatestFrom(of(undefined)),
      map(([request]) => request),
      switchMap((request) => {
        if (!request) {
          // immediately emit on null query
          return of({ documentsWithMetadata: [], request });
        }
        const {
          ref,
          ref: {
            path: { collection, authUid },
          },
        } = request;

        return this.store$.pipe(
          // Grab the collection items from the store
          select(collection, authUid),
          filter(isDefined),
          distinctUntilChanged(),
          map((storeSlice) => ({
            storeSlice,
            request,
          }))
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    return new DatastoreDocument(
      refStream$,
      this.storeBackend,
      combineLatest([sourceStream$]).pipe(
        map(([source]) => source),
        distinctUntilChanged()
      ) as unknown as Observable<C['DocumentType']>
    );
  }
  private generateClientRequestId(): string {
    return Math.random()
      .toString(36)
      .substring(2, 2 + 16);
  }
}
