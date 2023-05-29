import { Observable } from 'rxjs';
import {
  BackendErrorResponse,
  BackendSuccessReponse,
} from 'src/app/Services/BackendServices';
import {
  DatastoreCollectionType,
  DatastoreDeleteCollectionType,
  DatastorePushCollectionType,
  DatastoreSetCollectionType,
  DatastoreUpdateCollectionType,
  Reference,
} from './store.model';

export interface StoreBackendInterface {
  push<C extends DatastoreCollectionType & DatastorePushCollectionType>(
    ref: Reference<C>,
    document: DocumentType,
    extra?: { readonly [index: string]: string | number }
  ): Observable<BackendErrorResponse<C> | BackendSuccessReponse>;

  set<C extends DatastoreCollectionType & DatastoreSetCollectionType>(
    ref: Reference<C>,
    id: number | string,
    document: DocumentType
  ): Observable<BackendErrorResponse<C> | BackendSuccessReponse>;

  update<C extends DatastoreCollectionType & DatastoreUpdateCollectionType>(
    ref: Reference<C>,
    id: number | string,
    delta: C['DocumentType']
  ): Observable<BackendErrorResponse<C> | BackendSuccessReponse>;

  delete<C extends DatastoreCollectionType & DatastoreDeleteCollectionType>(
    ref: Reference<C>,
    id: number | string
  ): Observable<BackendErrorResponse<C> | BackendSuccessReponse>;
}
