// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import type { EnvironmentConfig } from './environment.types';
export const environment: EnvironmentConfig = {
  production: false,
  baseUrl: 'https://localhost:4200/',
  datastoreConfig: {
    webSocketUrl: 'http://127.0.0.1:5000',
    RESTAPIUrl: 'http://127.0.0.1:5001',
    enableStoreFreeze: true,
  },
  googleAccountClientId:
    '330531838931-l4lcnk4bc6nlu7fiamr6isvllutnf9iq.apps.googleusercontent.com',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
