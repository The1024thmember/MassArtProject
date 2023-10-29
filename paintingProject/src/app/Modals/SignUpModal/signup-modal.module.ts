import { NgModule } from '@angular/core';
import { ComponentLibraryModule } from 'src/app/ComponentLibrary';
import { DATASTORE_CONFIG } from 'src/app/Datastore/datastore.config';
import { GOOGLE_ACCOUNT_CLIENT_ID } from 'src/app/Services/BackendServices/AuthService';
import { environment } from 'src/environments/environment';
import { SignupModalComponent } from './signup-modal.component';

@NgModule({
  declarations: [SignupModalComponent],
  providers: [
    {
      provide: GOOGLE_ACCOUNT_CLIENT_ID,
      useValue: environment.googleAccountClientId,
    },
    {
      provide: DATASTORE_CONFIG,
      useValue: environment.datastoreConfig,
    },
  ],
  imports: [ComponentLibraryModule],
  exports: [SignupModalComponent],
  entryComponents: [SignupModalComponent],
})
export class SignUpModalModule {}
