import type { EnvironmentConfig } from './environment.types';
export const environment: EnvironmentConfig = {
  production: true,
  datastoreConfig: {
    webSocketUrl: 'https://backend-api.massart.gallery/api',
    RESTAPIUrl: 'https://backend-websocket.massart.gallery/websocket',
    enableStoreFreeze: true,
  },
  googleAccountClientId:
    '330531838931-l4lcnk4bc6nlu7fiamr6isvllutnf9iq.apps.googleusercontent.com',
};
