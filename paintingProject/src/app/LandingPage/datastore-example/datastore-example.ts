import { Component, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Datastore } from 'src/app/Datastore/datastore';

@Component({
  selector: 'datastore-example',
  template: `<button (click)="fetchData()">Click to fetch</button>
    <h2>Resources fetched:</h2>
    <p>{{ exampleResourceFetchResult$ | async }}</p>
    <button (click)="updateData()">Click to update</button>
    <h2>Resources updated:</h2>
    <p>{{ exampleResourceFetchResult$ | async }}</p>
    <button (click)="deleteData()">Click to delete</button>
    <h2>Resources updated:</h2>
    <p>{{ exampleResourceFetchResult$ | async }}</p>`,
})
export class DatastoreExampleComponent implements OnInit {
  title = 'datastore-blog';
  documentId: number = 1;
  exampleResourceFetch$: Observable<any> = of('undefined');
  exampleResourceFetchResult$: Observable<any> = of('undefined');
  exampleResource$: any;
  constructor(private datastore: Datastore) {}
  ngOnInit() {}

  fetchData() {
    this.exampleResource$ = this.datastore.document('example', this.documentId);
    this.exampleResourceFetch$ = this.exampleResource$.valueChanges();
    this.documentId += 1;

    this.exampleResourceFetchResult$ = this.exampleResourceFetch$.pipe(
      map((result) => result?.result)
    );
    this.exampleResourceFetchResult$.subscribe((fetchedResult) =>
      console.error('fetched result:', fetchedResult)
    );
  }
  updateData() {
    this.exampleResource$
      .update('updated value')
      .subscribe((exampleDocument: any) => {
        console.log('exampleDocument updateed:', exampleDocument);
      });
  }
  deleteData() {
    this.exampleResource$.delete().subscribe((exampleDocument: any) => {
      console.log('exampleDocument deleted:', exampleDocument);
    });
  }
}
