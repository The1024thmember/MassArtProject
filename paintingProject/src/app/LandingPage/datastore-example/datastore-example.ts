import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, map, of } from 'rxjs';
import { Datastore } from 'src/app/Datastore/datastore';
@UntilDestroy()
@Component({
  selector: 'datastore-example',
  template: ` <h2>Resources fetched:</h2>
    <p>{{ exampleResourceFetchResult$ | async }}</p>
    <button (click)="fetchData()">Click to fetch</button>
    <h2>Resources updated via rest API:</h2>
    <p>{{ exampleResourceFetchResult$ | async }}</p>
    <button (click)="updateData()">Click to update via REST api</button>
    <h2>Resources updated via WS</h2>
    <p>{{ exampleResourceFetchResult$ | async }}</p>
    <button (click)="updateDataWS()">Click to update via WS</button>
    <h2>Resources deleted:</h2>
    <p>{{ exampleResourceFetchResult$ | async }}</p>
    <button (click)="deleteData()">Click to delete</button>
    <h2>Resources posted via rest API:</h2>
    <p>{{ exampleResourceFetchResult$ | async }}</p>
    <button (click)="postData()">Click to post via REST api</button>
    <h2>Resources posted via WS:</h2>
    <p>{{ exampleResourceFetchResult$ | async }}</p>
    <button (click)="postDataWS()">Click to post via WS</button>
    <p></p>`,
})
export class DatastoreExampleComponent implements OnInit, OnDestroy {
  title = 'datastore-blog';
  documentId: number = 1;
  exampleResourceFetch$: Observable<any> = of('undefined');
  exampleResourceFetchResult$: Observable<any> = of('undefined');
  exampleResource$: any;
  constructor(private datastore: Datastore) {}
  ngOnInit() {}

  fetchData() {
    this.exampleResource$ = this.datastore.document(
      'drawEvent',
      this.documentId
    );
    this.exampleResourceFetch$ = this.exampleResource$.valueChanges();
    this.documentId += 1;

    this.exampleResourceFetchResult$ = this.exampleResourceFetch$.pipe(
      map((result) => result?.result)
    );
  }
  updateData() {
    this.exampleResource$
      .update('RESTAPI', 'updated value')
      .pipe(untilDestroyed(this))
      .subscribe((exampleDocument: any) => {
        console.log('exampleDocument updateed:', exampleDocument);
      });
  }
  updateDataWS() {
    this.exampleResource$
      .update('WS', 'WS updated value', {
        requestId: new Date().toLocaleTimeString(),
      })
      .pipe(untilDestroyed(this))
      .subscribe((exampleDocument: any) => {
        console.log('exampleDocument updateed:', exampleDocument);
      });
  }

  deleteData() {
    this.exampleResource$.delete().subscribe((exampleDocument: any) => {
      console.log('exampleDocument deleted:', exampleDocument);
    });
  }
  postData() {
    this.datastore
      .createDocument('RESTAPI', 'example', 'new document')
      .then((response) => {
        console.log('response for creating new doc:', response);
      });
  }

  postDataWS() {
    this.datastore
      .createDocument('WS', 'example', 'ws new doc', {
        requestId: new Date().toLocaleTimeString(),
      })
      .then((response) => {
        console.error('ws response for new doc:', response);
      });
  }

  ngOnDestroy(): void {
    this.exampleResource$.unsubscribe();
  }
}
