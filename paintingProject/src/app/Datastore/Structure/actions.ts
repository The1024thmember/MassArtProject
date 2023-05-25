import {
  DatastoreCollectionType,
  DatastoreDeleteCollectionType,
  DatastoreFetchCollectionType,
  DatastorePushCollectionType,
  DatastoreSetCollectionType,
  DatastoreUpdateCollectionType,
  Reference,
} from './store.model';

export interface FetchSuccessAction<
  C extends DatastoreCollectionType & DatastoreFetchCollectionType
> {
  readonly type: 'API_FETCH_SUCCESS';
  readonly payload: FetchSuccessPayload<C>;
}

export interface FetchErrorAction<
  C extends DatastoreCollectionType & DatastoreFetchCollectionType
> {
  readonly type: 'API_FETCH_ERROR';
  readonly payload: FetchErrorPayload<C>;
}

export interface PushAction<
  C extends DatastoreCollectionType & DatastorePushCollectionType
> {
  readonly type: 'API_PUSH';
  readonly payload: PushRequestPayload<C>;
}

export interface PushSuccessAction<
  C extends DatastoreCollectionType & DatastorePushCollectionType
> {
  readonly type: 'API_PUSH_SUCCESS';
  readonly payload: PushSuccessPayload<C>;
}

export interface PushErrorAction<
  C extends DatastoreCollectionType & DatastorePushCollectionType
> {
  readonly type: 'API_PUSH_ERROR';
  readonly payload: PushErrorPayload<C>;
}

export interface SetAction<
  C extends DatastoreCollectionType & DatastoreSetCollectionType
> {
  readonly type: 'API_SET';
  readonly payload: SetRequestPayload<C>;
}

export interface SetSuccessAction<
  C extends DatastoreCollectionType & DatastoreSetCollectionType
> {
  readonly type: 'API_SET_SUCCESS';
  readonly payload: SetSuccessPayload<C>;
}

export interface SetErrorAction<
  C extends DatastoreCollectionType & DatastoreSetCollectionType
> {
  readonly type: 'API_SET_ERROR';
  readonly payload: SetErrorPayload<C>;
}

export interface UpdateAction<
  C extends DatastoreCollectionType & DatastoreUpdateCollectionType
> {
  readonly type: 'API_UPDATE';
  readonly payload: UpdateRequestPayload<C>;
}

export interface UpdateSuccessAction<
  C extends DatastoreCollectionType & DatastoreUpdateCollectionType
> {
  readonly type: 'API_UPDATE_SUCCESS';
  readonly payload: UpdateSuccessPayload<C>;
}

export interface UpdateErrorAction<
  C extends DatastoreCollectionType & DatastoreUpdateCollectionType
> {
  readonly type: 'API_UPDATE_ERROR';
  readonly payload: UpdateErrorPayload<C>;
}

export interface DeleteAction<
  C extends DatastoreCollectionType & DatastoreDeleteCollectionType
> {
  readonly type: 'API_DELETE';
  readonly payload: DeleteRequestPayload<C>;
}

export interface DeleteSuccessAction<
  C extends DatastoreCollectionType & DatastoreDeleteCollectionType
> {
  readonly type: 'API_DELETE_SUCCESS';
  readonly payload: DeleteSuccessPayload<C>;
}

export interface DeleteErrorAction<
  C extends DatastoreCollectionType & DatastoreDeleteCollectionType
> {
  readonly type: 'API_DELETE_ERROR';
  readonly payload: DeleteErrorPayload<C>;
}

export interface RequestDataAction<C extends DatastoreCollectionType> {
  readonly type: 'REQUEST_DATA';
  readonly payload: RequestDataPayload<C>;
}

export interface WsMessageAction<C extends DatastoreCollectionType> {
  readonly type: 'WS_MESSAGE';
  readonly no_persist: boolean;
  readonly payload: WebsocketActionPayload<C>;
}

export type CollectionActions<C extends DatastoreCollectionType> =
  // | { type: 'API_FETCH'; payload: FetchRequestPayload<T> }
  | (C extends DatastoreFetchCollectionType ? FetchSuccessAction<C> : never)
  | (C extends DatastoreFetchCollectionType ? FetchErrorAction<C> : never)
  | (C extends DatastorePushCollectionType ? PushAction<C> : never)
  | (C extends DatastorePushCollectionType ? PushSuccessAction<C> : never)
  | (C extends DatastorePushCollectionType ? PushErrorAction<C> : never)
  | (C extends DatastoreSetCollectionType ? SetAction<C> : never)
  | (C extends DatastoreSetCollectionType ? SetSuccessAction<C> : never)
  | (C extends DatastoreSetCollectionType ? SetErrorAction<C> : never)
  | (C extends DatastoreUpdateCollectionType ? UpdateAction<C> : never)
  | (C extends DatastoreUpdateCollectionType ? UpdateSuccessAction<C> : never)
  | (C extends DatastoreUpdateCollectionType ? UpdateErrorAction<C> : never)
  | (C extends DatastoreDeleteCollectionType ? DeleteAction<C> : never)
  | (C extends DatastoreDeleteCollectionType ? DeleteSuccessAction<C> : never)
  | (C extends DatastoreDeleteCollectionType ? DeleteErrorAction<C> : never)
  | RequestDataAction<C>
  | WsMessageAction<C>;

/****************************************
 *  Request data                        *
 ****************************************/

export interface RequestDataPayload<C extends DatastoreCollectionType> {
  readonly type: C['Name'];
  readonly ref: Reference<C>;
}

/****************************************
 *  Websocket                           *
 ****************************************/

export type WebsocketActionPayload<C extends DatastoreCollectionType> =
  C['Backend']['WebsocketType'] & {
    readonly toUserId: string;
  };

/**
 * List of actions for every root model.
 */
export type TypedAction = CollectionActions<any>;

/****************************************
 *  Type guards                         *
 ****************************************/

export function isRequestDataAction(a: TypedAction): a is {
  readonly type: 'REQUEST_DATA';
  readonly payload: RequestDataPayload<any>; // FIXME: T267853 -
} {
  return a.type === 'REQUEST_DATA';
}

export function isApiFetchSuccessAction(
  a: TypedAction
): a is FetchSuccessAction<any> {
  return a.type === 'API_FETCH_SUCCESS';
}

export function isWebsocketAction<C extends DatastoreCollectionType>(
  a: TypedAction
): a is WsMessageAction<C> {
  return a.type === 'WS_MESSAGE';
}
