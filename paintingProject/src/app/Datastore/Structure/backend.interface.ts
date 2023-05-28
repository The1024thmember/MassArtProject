import { Observable } from 'rxjs';
import {
  DatastoreCollectionType,
  DatastoreDeleteCollectionType,
  DatastorePushCollectionType,
  DatastoreSetCollectionType,
  DatastoreUpdateCollectionType,
  Reference,
} from './store.model';

export interface StoreBackendInterface {
  defaultOrder<C extends DatastoreCollectionType>(
    collection: C['Name']
  ): Ordering<C>;
  // This isn't needed for a fake one.
  // fetch<C extends DatastoreCollectionType>(
  //   ref: Reference<C>,
  // ): Rx.Observable<ApiFetchResponse<C>>;

  push<C extends DatastoreCollectionType & DatastorePushCollectionType>(
    ref: Reference<C>,
    document: PushDocumentType<C>,
    extra?: { readonly [index: string]: string | number }
  ): Observable<BackendPushResponse<C>>;

  set<C extends DatastoreCollectionType & DatastoreSetCollectionType>(
    ref: Reference<C>,
    id: number | string,
    document: SetDocumentType<C>
  ): Observable<BackendSetResponse<C>>;

  update<C extends DatastoreCollectionType & DatastoreUpdateCollectionType>(
    ref: Reference<C>,
    id: number | string,
    delta: C['DocumentType']
  ): Observable<BackendUpdateResponse<C>>;

  delete<C extends DatastoreCollectionType & DatastoreDeleteCollectionType>(
    ref: Reference<C>,
    id: number | string
  ): Observable<BackendDeleteResponse<C>>;
}
