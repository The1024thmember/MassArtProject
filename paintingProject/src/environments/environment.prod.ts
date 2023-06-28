import type { EnvironmentConfig } from './environment.types';
export const environment: EnvironmentConfig = {
  production: false,
  datastoreConfig: {
    webSocketUrl: 'http://127.0.0.1:5000',
    RESTAPIUrl: 'http://127.0.0.1:5001',
    enableStoreFreeze: true,
  },
  googleAccountClientId:
    '330531838931-l4lcnk4bc6nlu7fiamr6isvllutnf9iq.apps.googleusercontent.com',
};
