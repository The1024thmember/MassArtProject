import { ApplicationRef, Injectable, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import {
  Observable,
  Subscription,
  map,
  of,
  shareReplay,
  switchMap,
  take,
  takeWhile,
  tap,
} from 'rxjs';
import { StoreBackend } from './backend';
import { DatastoreDocument } from './datastore-document';

@Injectable()
export class Datastore implements OnDestroy {
  private isInitiallyStable$: Observable<boolean>;
  private subscriptions = new Subscription();
  constructor(
    private store$: Store<any>, //private action$: Actions<any>,
    private storeBackend: StoreBackend,
    private appRef: ApplicationRef
  ) {
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

  document(collectionName: string, documentId: string | number) {
    const collectionRef$ = of({ collectionName, documentId });
    const request$ = collectionRef$.pipe(
      switchMap((collectionRef) =>
        this.store$.pipe(
          select(collectionRef.collectionName, collectionRef.documentId), // this select can be removed, basically it returns the result from datastore initially before the requested data arrives
          take(1), // only take one, otherwise it will go into a loop
          map((store) => {
            // we need to somehow slice the value based on userId and document id
            return store;
          }),
          tap((document) => {
            const action = {
              type: 'REQUEST_DATA',
              payload: {
                authUid: 1,
                params: documentId,
                collection: collectionName,
                query: '',
              },
            };
            this.store$.dispatch(action);
          })
        )
      )
    );

    // This is when the result of datastore is updated with the latest fetch
    const source$ = request$.pipe(
      switchMap((request) => {
        return this.store$.pipe(
          tap(() =>
            console.log(
              'collectionName, documentId',
              collectionName,
              documentId
            )
          ),
          select(collectionName, documentId),
          map((storeSlice) => {
            console.warn('storeSlice:', storeSlice); // for somereason the slice here initally gives the full store value then change to a specific document
            return storeSlice;
          })
        );
      })
    );

    return new DatastoreDocument(collectionRef$, source$, this.storeBackend); // the this.store$ need to be removed
  }
}
