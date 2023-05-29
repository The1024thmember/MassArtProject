export interface EnvironmentConfig {
  production: boolean;
  datastoreConfig: {
    webSocketUrl: string;
    enableStoreFreeze: boolean;
  };
}
