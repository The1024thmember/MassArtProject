export interface EnvironmentConfig {
  production: boolean;
  baseUrl: string;
  datastoreConfig: DatastoreConfig;
  googleAccountClientId: string;
}

export interface DatastoreConfig {
  webSocketUrl: string;
  RESTAPIUrl: string;
  enableStoreFreeze: boolean;
}
