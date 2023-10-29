import type { EnvironmentConfig } from './environment.types';
export const environment: EnvironmentConfig = {
  production: true,
  baseUrl: 'https://dev.massart.gallery/',
  datastoreConfig: {
    webSocketUrl: 'https://backend-websocket.massart.gallery/exp',
    RESTAPIUrl: 'https://backend-api.massart.gallery/api',
    enableStoreFreeze: true,
  },
  googleAccountClientId:
    '330531838931-l4lcnk4bc6nlu7fiamr6isvllutnf9iq.apps.googleusercontent.com', // need to get updated
};
