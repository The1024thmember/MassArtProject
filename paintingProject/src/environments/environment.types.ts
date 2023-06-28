export interface EnvironmentConfig {
  production: boolean;
  datastoreConfig: {
    webSocketUrl: string;
    RESTAPIUrl: string;
    enableStoreFreeze: boolean;
  };
  googleAccountClientId: string;
}
