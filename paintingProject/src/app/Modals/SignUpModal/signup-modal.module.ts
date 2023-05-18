import { NgModule } from '@angular/core';
import { ComponentLibraryModule } from 'src/app/ComponentLibrary';
import { SignupModalComponent } from './signup-modal.component';

@NgModule({
  declarations: [SignupModalComponent],
  imports: [ComponentLibraryModule],
  exports: [SignupModalComponent],
  entryComponents: [SignupModalComponent],
})
export class SignUpModalModule {}
