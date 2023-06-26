import { Observable, filter, map, switchMap } from 'rxjs';
import { WebSocketService } from './Websocket/webscoket';
import { BackEndInterface } from './backend';

export class DatastoreDocument {
  constructor(
    private ref$: Observable<any>,
    private valueChanges$: Observable<any>,
    private StoreBackend: BackEndInterface,
    private webSocket: WebSocketService
  ) {}

  valueChanges(): Observable<any> {
    return this.valueChanges$;
  }

  update(
    method: 'RESTAPI' | 'WS' = 'RESTAPI',
    delta: any,
    extra?: any
  ): Observable<any> {
    const request = {
      endpoint: '',
    };
    const body = '';

    return this.ref$.pipe(
      switchMap(({ collectionName, documentId }) => {
        const ref = {
          authUid: 1,
          params: documentId,
          collection: collectionName,
          query: '',
        };
        console.log('method:', method);
        if (method === 'RESTAPI') {
          return this.StoreBackend.update(ref, documentId, delta).pipe(
            map((response) => {
              const res = {
                response,
                request: {
                  collection: collectionName,
                  id: documentId,
                },
              };
              return res;
            })
          );
        } else {
          // Integrate WS event here
          return this.webSocket.send({ ref, document: delta, extra }).pipe(
            // since BE can send lots of response message, need to make sure the response message is answering this particualr request
            filter((RequestReponse) => {
              return RequestReponse.requestId === extra?.['requestId'];
            }),
            // for update document, we care about the id of the document and the document itself as well
            map((RequestReponse) => RequestReponse)
          );
        }
      })
    );
  }

  delete(): Observable<any> {
    const request = {
      endpoint: '',
    };

    return this.ref$.pipe(
      switchMap(({ collectionName, documentId }) => {
        const ref = {
          authUid: 1,
          params: documentId,
          collection: collectionName,
        };
        return this.StoreBackend.delete(ref, documentId).pipe(
          map((response) => {
            const res = {
              response,
              request: {
                collection: collectionName,
                id: documentId,
              },
            };
            return res;
          })
        );
      })
    );
  }
}
