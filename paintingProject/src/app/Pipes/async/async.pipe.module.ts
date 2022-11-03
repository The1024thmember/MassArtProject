import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, NgModule, Provider } from '@angular/core';
import { MyAsyncPipe } from './async.pipe';

@NgModule({
  declarations: [MyAsyncPipe],
  exports: [MyAsyncPipe],
  providers: [AsyncPipe, ChangeDetectorRef as Provider, MyAsyncPipe],
})
export class MyAsyncPipeModule {}
