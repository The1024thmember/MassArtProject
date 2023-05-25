// Provide entry point for set(), push(), update() and delete() action, use valueChanges() for the data
// of the document

import { Observable, map, of, switchMap } from 'rxjs';
import { StoreBackendInterface } from './backend.interface';
import { DatastoreCollectionType, Reference } from './store.model';

export class DatastoreDocument<C extends DatastoreCollectionType> {
  private id$: Observable<string>;

  constructor(
    private ref$: Observable<Reference<C>>,
    private storeBackend: StoreBackendInterface,
    // public status$: Observable<RequestStatus<C>>,
    private valueChanges$: Observable<C['DocumentType']>
  ) {
    this.id$ = this.ref$.pipe(
      switchMap((ref) =>
        ref.path.ids
          ? of(ref.path.ids[0])
          : this.valueChanges$.pipe(
              map((valueChange) => valueChange.id.toString())
            )
      )
    );
  }

  valueChanges(): Observable<C['DocumentType']> {
    return this.valueChanges$;
  }

  set(
    // Make calling this function fail if you haven't defined `C['Backend']['Set']`
    document: C['Backend']['Set'] extends never ? never : C['DocumentType']
  ): Promise<BackendSetResponse<DatastoreCollectionType<C>>> {
    return firstValueFrom(
      combineLatest([this.ref$, this.id$]).pipe(
        take(1),
        map(
          // Unfortunate type casting
          ([ref, id]) =>
            [
              ref as unknown as Reference<DatastoreCollectionType<C>>,
              id,
            ] as const
        ),
        switchMap(([ref, id]) => this.storeBackend.set(ref, id, document))
      )
    );
  }

  update(
    // Make calling this function fail if you haven't defined `C['Backend']['Update']`
    delta: C['Backend']['Update'] extends never
      ? never
      : RecursivePartial<C['DocumentType']>
  ): Promise<BackendUpdateResponse<MaybeDatastoreUpdateCollectionType<C>>> {
    return firstValueFrom(
      combineLatest([this.ref$, this.id$]).pipe(
        take(1),
        map(
          // Unfortunate type casting
          ([ref, id]) =>
            [
              ref as unknown as Reference<
                MaybeDatastoreUpdateCollectionType<C>
              >,
              id,
            ] as const
        ),
        switchMap(([ref, id]) =>
          this.storeBackend.update<MaybeDatastoreUpdateCollectionType<C>>(
            ref,
            id,
            delta
          )
        )
      )
    );
  }

  remove(): Promise<
    BackendDeleteResponse<MaybeDatastoreDeleteCollectionType<C>>
  > {
    return firstValueFrom(
      combineLatest([this.ref$, this.id$]).pipe(
        take(1),
        map(
          // Unfortunate type casting
          ([ref, id]) =>
            [
              ref as unknown as Reference<
                MaybeDatastoreDeleteCollectionType<C>
              >,
              id,
            ] as const
        ),
        switchMap(([ref, id]) => this.storeBackend.delete(ref, id))
      )
    );
  }
}
