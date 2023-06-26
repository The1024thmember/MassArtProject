import { ApplicationRef, Injectable, OnDestroy } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Store, select } from '@ngrx/store';
import {
  Observable,
  Subscription,
  combineLatest,
  filter,
  firstValueFrom,
  map,
  of,
  shareReplay,
  switchMap,
  take,
  takeWhile,
  tap,
} from 'rxjs';
import { WebSocketService } from './Websocket/webscoket';
import { StoreBackend } from './backend';
import { DatastoreDocument } from './datastore-document';
@Injectable()
export class Datastore implements OnDestroy {
  private isInitiallyStable$: Observable<boolean>;
  private subscriptions = new Subscription();
  constructor(
    private store$: Store<any>, //private action$: Actions<any>,
    private storeBackend: StoreBackend,
    private appRef: ApplicationRef,
    private webSocket: WebSocketService
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

    return new DatastoreDocument(
      collectionRef$,
      source$,
      this.storeBackend,
      this.webSocket
    );
  }

  /**
   * Creates a single document via REST api
   */
  createDocument(
    method: 'RESTAPI' | 'WS' = 'RESTAPI',
    collectionName: string,
    document: any,
    extra?: { readonly [index: string]: string | number }
  ): Promise<any> {
    return firstValueFrom(
      combineLatest([of(collectionName)]).pipe(
        map(([collectionName]) => {
          const ref = {
            collection: collectionName,
            authUid: 1,
          };
          return ref;
        }),
        take(1),
        switchMap((ref) => {
          if (method === 'RESTAPI') {
            return this.storeBackend.push(ref, document, extra);
          } else {
            // need to handle when the websockeet disconnects,
            // and waiting for the servers' response, what if the server response slow or it disconnects, how to handle that?
            // can potentially have a pending message queue, and here it returns the pending queue status, if the websocket returns
            // the response towards that message (with id), then we return success
            return this.webSocket.send({ ref, document, extra }).pipe(
              // since BE can send lots of response message, need to make sure the response message is answering this particualr request
              // but the front-end should determine the request id, with authId &
              filter((RequestReponse) => {
                return RequestReponse.requestId === extra?.['requestId'];
              }),
              // for create document, we only care about the id of the document to
              // ensure the client has the same order of object as server (specific to mass art drawing object)
              map((RequestReponse) => RequestReponse)
            );
          }
        }),
        untilDestroyed(this)
      )
    );
  }
}
