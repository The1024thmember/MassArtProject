export interface DatastoreCollectionType {
  readonly Name: string;
  readonly DocumentType: ObjectWithId;
  /**
   * Field used to specify a documents parent resource in-which can be used to
   * group separate document requests into a single network request.
   *
   * You can use this field when making document requests so that it is
   * available to you in your the *.backend.ts files.
   *
   * The datastore will automatically batch these requests by including the
   * parent resource, serialised, into the store.
   */
  readonly ResourceGroup?: object;
  readonly Backend: {
    readonly Fetch?: BackendType;
    readonly Push?: BackendType;
    readonly Set?: BackendType;
    readonly Update?: BackendType;
    readonly Delete?: BackendType;
    readonly WebsocketType?: unknown;
  };
  readonly HasTotalCount: boolean;
}

interface ObjectWithId {
  readonly id: number | string;
}

export interface BackendType {
  readonly PayloadType: object | undefined;
  readonly ReturnType: unknown;
  readonly ErrorType: unknown;
}

export interface DatastoreFetchCollectionType {
  readonly Backend: { readonly Fetch: BackendType };
}

export interface DatastorePushCollectionType {
  readonly Backend: { readonly Push: BackendType };
}

export interface DatastoreSetCollectionType {
  readonly Backend: { readonly Set: BackendType };
}

export interface DatastoreUpdateCollectionType {
  readonly Backend: { readonly Update: BackendType };
}

export interface DatastoreDeleteCollectionType {
  readonly Backend: { readonly Delete: BackendType };
}

export interface Reference<C extends DatastoreCollectionType> {
  readonly path: Path<C>;
}

export interface Path<C> {
  readonly collection: DatastoreCollectionType['Name'];
  readonly authUid: string; // '0' if logged out
  readonly ids?: readonly string[];
}
