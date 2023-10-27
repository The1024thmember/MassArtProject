import { Injectable, OnDestroy } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { QueueSubject } from './util';
import { ObservableWebSocket } from './websocket.factory';

enum ConnectionStatus {
  CLOSED,
  OPEN,
}
@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  /**
   * This observable wraps the underlying web socket connection. When subscribed to, it:
   *  - Opens the web socket connection
   *  - Emits an observable that will emit server responses
   *  - Closes the connection when the observable is unsubscribed from
   */
  private _websocket$: ObservableWebSocket | undefined;
  private serverResponseSubscription: Subscription;
  private fromServerStreamSubject$ = new Subject<any>();
  private connectionStatusSubject$ = new BehaviorSubject<ConnectionStatus>(
    ConnectionStatus.CLOSED
  );

  answeredMessageSubject$ = new Subject<any>();
  id = 0;

  constructor(
    // @Inject(DATASTORE_CONFIG) private datastoreConfig: DatastoreConfig,
    // @Inject(RECONNECT_CONFIG) private reconnectConfig: ReconnectConfig,
    private store$: Store<any>
  ) {
    this.serverResponseSubscription = this.serverResponse$.subscribe({
      next: ({ serverResponse, userId }) => {
        console.log('serverResponse:', serverResponse);
        const data = JSON.stringify({
          document: serverResponse.result.result,
          collection: serverResponse.collection,
          id: serverResponse.id,
        });
        const serverResponseData = {
          type: serverResponse.type,
          ...JSON.parse(data),
        };
        console.warn('serverResponseData:', serverResponseData);
        this.processServerResponse(serverResponseData, userId);
      },

      error: () => {},

      complete: () => {
        this.fromServerStreamSubject$.complete();
        this.connectionStatusSubject$.next(ConnectionStatus.CLOSED);
      },
    });
    this.id += 1;
  }

  get websocket$(): ObservableWebSocket {
    if (!this._websocket$) {
      this._websocket$ = new ObservableWebSocket(
        'https://backend-websocket.massart.gallery/websocket/exp' // temporary, when datastoreConfig is implemented need to use datastoreConfig
        //this.datastoreConfig.webSocketUrl
      );
    }
    console.log('connect websocket');
    return this._websocket$;
  }

  private messagesQueueSubject$ = new QueueSubject<any>();

  /**
   * This function creates an observable that combines the latest values
   * emitted by the authState$ and requestReconnectionSubject$ observables,
   * filters out any values where isDefined is false, and maps the remaining
   * values to authState, marking the connection as closed. It then switches
   * to a new observable produced by the websocket$ observable, which contains
   * the original serverResponse$ observable and the authState.
   *
   * The new observable sends an authorization message to the websocket, subscribes
   * to events from the server, tracks a custom event based on the reconnection count,
   * increments the reconnectionCount, sets the connection status to open, and sends
   * all messages in the messagesQueueSubject$ to the websocket. The function returns
   * an observable that maps server responses to an object with the original serverResponse
   * and authState.
   *
   * If a NonCleanDisconnectError is thrown, the sequence will be retried with a delay based
   * on the number of previous retry attempts, capped at a maximum of approximately 30 seconds.
   * The retry attempt will be made when the delay is reached or the browser goes online.
   *
   * @return {Rx.Observable<WebSocketResponse>} An observable of websocket responses.
   */
  get serverResponse$(): Observable<any> {
    return this.websocket$.pipe(
      switchMap((serverResponseFromSocket$) => {
        this.messagesQueueSubject$.addFirst({
          result: 'hey!',
          collection: 'example',
          id: 1,
        });
        this.websocket$.send?.(this.messagesQueueSubject$);
        return serverResponseFromSocket$; // of({ serverResponse: 'success', userId: 1 });
      })
    );
  }

  processServerResponse(serverResponseData: any, userId: string): void {
    this.processServerMessage(serverResponseData, userId);
  }

  private processServerMessage(event: any, toUserId: string): void {
    const { body } = event;
    console.log('event:', event);
    const action: any = {
      type: 'WS_MESSAGE',
      //no_persist: body.no_persist,
      payload: {
        ...body,
        result: event.document[0],
        collection: event.collection,
        id: event.id,
        toUserId, // all WebSocket messages are tied to the current user
      },
    };

    this.store$.dispatch(action); // the corresponding document changes whenever
    // the server sending somthing to the client, and the client only need to subscribe
    // use this.datastore.document('example', this.documentId).valueChanges()

    // Request_response is the type of WS message from server that is for answering the request
    // from client of either create or change object
    if (event.type === 'Request_response') {
      const response = {
        status: 'success',
        id: event.body.id,
        requestId: event.body.result.requestId,
        collection: event.body.collection,
      };
      this.answeredMessageSubject$.next(response);
    }
  }

  ngOnDestroy(): void {
    this.serverResponseSubscription?.unsubscribe();
  }

  /**
   * This function will put the message into the queue and
   * once the connection established it's safe to send the message.
   *
   * @param message
   */
  send(message: any): Observable<any> {
    console.log('message:', message);
    const messageToSend = {
      collection: message.ref.collection,
      id: this.id, //doc id
      result: { result: message.document, requestId: message.extra.requestId },
    };
    console.log('messageToSend:', messageToSend);
    this.messagesQueueSubject$.next(messageToSend);
    this.id += 1;
    return this.answeredMessageSubject$;
  }
}
