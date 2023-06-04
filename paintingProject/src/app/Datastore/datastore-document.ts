import { Observable, map, switchMap } from 'rxjs';
import { BackEndInterface } from './backend';

export class DatastoreDocument {
  constructor(
    private ref$: Observable<any>,
    private valueChanges$: Observable<any>,
    private StoreBackend: BackEndInterface
  ) {}

  valueChanges(): Observable<any> {
    return this.valueChanges$;
  }

  update(delta: any): Observable<any> {
    // const request = update(path.authUid, delta, originalDocument); // here the update function is defined in  *.backend.ts
    const request = {
      endpoint: '',
    };
    const body = '';

    return this.ref$.pipe(
      // switchMap(({ collectionName, documentId }) => {
      //   return this.http.post(request.endpoint, body, documentId).pipe(
      //     map((response) => {
      //       const res = {
      //         response,
      //         request: {
      //           collection: collectionName,
      //           id: documentId,
      //         },
      //       };
      //       return res;
      //     })
      //   );
      // }),

      switchMap(({ collectionName, documentId }) => {
        const ref = {
          authUid: 1,
          params: documentId,
          collection: collectionName,
          query: '',
        };
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
      })
      // map(({ response, request }) => {
      //   const action = {
      //     type: 'API_UPDATE_SUCCESS',
      //     payload: {
      //       result: response,
      //       id: request.id,
      //       collection: request.collection,
      //     },
      //   };
      //   return this.store$.dispatch(action);
      // })
    );
  }

  delete(): Observable<any> {
    // const request = delete(path.authUid, delta, originalDocument); // here the delete function is defined in  *.backend.ts
    const request = {
      endpoint: '',
    };

    return this.ref$.pipe(
      // switchMap(({ collectionName, documentId }) => {
      //   return this.http.delete(request.endpoint, documentId).pipe(
      //     map((response) => {
      //       const res = {
      //         response,
      //         request: {
      //           collection: collectionName,
      //           id: documentId,
      //         },
      //       };
      //       return res;
      //     })
      //   );
      // }),

      switchMap(({ collectionName, documentId }) => {
        return this.StoreBackend.delete({ collectionName, documentId }).pipe(
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
      // map(({ response, request }) => {
      //   const action = {
      //     type: 'API_DELETE_SUCCESS',
      //     payload: {
      //       result: response,
      //       id: request.id,
      //       collection: request.collection,
      //     },
      //   };
      //   return this.store$.dispatch(action);
      // })
    );
  }
}
