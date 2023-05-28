import { Type } from '@angular/core';
import { HttpAdapter } from '../../Services/BackendServices';
export interface DatastoreConfig {
  readonly webSocketUrl: string;
  readonly enableStoreFreeze: boolean;
  readonly httpAdapter: Type<HttpAdapter>;
}

/** Auth user ID for logged-out use of the datastore */
export const LOGGED_OUT_KEY = '0';
