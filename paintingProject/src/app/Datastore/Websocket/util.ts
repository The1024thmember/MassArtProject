import type { PartialObserver, Subscription } from 'rxjs';
import { Subject } from 'rxjs';

/**
 * The original implementation of this class can be found here:
 * https://github.com/huan/rx-queue/blob/main/src/rx-queue.ts
 */
// eslint-disable-next-line rxjs/no-subclass
export class QueueSubject<T = unknown> extends Subject<T> {
  private itemList: readonly T[] = [];

  addFirst(item: T): void {
    this.itemList = [item, ...this.itemList];
  }

  override next(item: T): void {
    if (this.observed) {
      super.next(item);
    } else {
      this.itemList = [...this.itemList, item];
    }
  }

  override subscribe(observer: PartialObserver<T>): Subscription;
  override subscribe(
    next: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): Subscription;
  override subscribe(...args: never[]): never;
  override subscribe(
    nextOrObserver: ((value: T) => void) | PartialObserver<T>,
    error?: (error: any) => void,
    complete?: () => void
  ): Subscription {
    let subscription: Subscription; // TypeScript strict require strong typing differenciation
    if (typeof nextOrObserver === 'function') {
      subscription = super.subscribe({ next: nextOrObserver, error, complete });
    } else {
      subscription = super.subscribe(nextOrObserver);
    }
    this.itemList.forEach((item) => this.next(item));
    this.itemList = [];
    return subscription;
  }
}
