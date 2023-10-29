import { InjectionToken } from '@angular/core';
import { DatastoreConfig } from 'src/environments/environment.types';

export const DATASTORE_CONFIG = new InjectionToken<DatastoreConfig>(
  'Datastore Configuration'
);
