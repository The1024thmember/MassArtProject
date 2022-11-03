import { AsyncPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Subscribable } from 'rxjs';

@Pipe({ name: 'myAsync', pure: false })
export class MyAsyncPipe extends AsyncPipe implements PipeTransform {
  override transform<T>(
    obj$: Subscribable<T> | Promise<T> | null | undefined
  ): T | undefined;
  override transform<T>(obj: null | undefined): undefined;

  override transform<T>(obj$: any): T | undefined {
    return super.transform<T>(obj$) ?? undefined;
  }
}
