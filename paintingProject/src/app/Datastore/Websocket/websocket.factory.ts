import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { Socket, io } from 'socket.io-client';

/**
 * This class is responsible for creating an observable that maintains
 * the connection and sends messages to the backend after the WebSocket
 * connection has been established.
 *
 * The WebSocket connection can be established by passing in a string
 * representing the URL of the WebSocket server, or by passing in a
 * Socket object representing an established WebSocket connection.
 *
 * When the ObservableWebSocket is subscribed to, it sets up the
 * WebSocket connection and sends messages to the server. It also
 * listens for messages from the server and emits them as values of
 * the ObservableWebSocket.
 *
 * The ObservableWebSocket can be unsubscribed from, which will close
 * the WebSocket connection.
 */
export class ObservableWebSocket extends Observable<Observable<any>> {
  public static readonly HEARTBEAT_MISSING_THRESHOLD = 60;
  private socket: Socket | undefined;
  private messagesStreamSubscription?: Subscription;
  constructor(private webSocketUrlOrSocket: string | Socket) {
    super();
  }

  /**
   * A method that is called when the ObservableWebSocket is subscribed to.
   * It is responsible for setting up the WebSocket connection and sending
   * messages to the server.
   *
   * @param observer - the observer to be notified of the WebSocket connection and messages
   * @returns a function that can be called to unsubscribe from the ObservableWebSocket
   */
  _subscribe(observer: Subscriber<Observable<any>>): () => void {
    if (typeof this.webSocketUrlOrSocket === 'string') {
      this.socket = io(this.webSocketUrlOrSocket);
    } else {
      this.socket = this.webSocketUrlOrSocket;
    }
    const serverResponseSubject$ = new Subject<any>();

    let isClosed = false;

    /**
     * The event listener for the "open" event of the WebSocket connection.
     * It is called when the WebSocket connection is established.
     *
     * If the connection was closed by calling the unsubscribe method,
     * the WebSocket connection is closed. Otherwise, the
     * serverResponseSubject$ is emitted as the next value of the
     * ObservableWebSocket, the heartbeat listener function is set up,
     * and the heartbeat listener is added to the WebSocket connection.
     */
    this.socket.on('connect', () => {
      console.warn('open - observer emits serverResponseSubject');
      observer.next(serverResponseSubject$);
      // observer.next(of({ serverResponse: 'success', userId: 1 })); // test why serverResponseSubscription is always undefined
    });

    /**
     * The event listener for the "error" event of the WebSocket connection.
     * It is called when an error occurs on the WebSocket connection.
     *
     * The isClosed flag is set to true and the error is emitted as an
     * error value of the ObservableWebSocket.
     */
    this.socket.on('error', (e: any) => {
      isClosed = true;
      observer.error(e);
    });

    /**
     * The event listener for the "close" event of the WebSocket connection.
     * It is called when the WebSocket connection is closed.
     *
     * The isClosed flag is set to true. If the WebSocket connection was
     * closed in a clean way or by calling the unsubscribe method, the
     * ObservableWebSocket is completed. If the WebSocket connection was
     * closed unexpectedly, a NonCleanDisconnectError is emitted as an
     * error value of the ObservableWebSocket.
     */
    this.socket.on('close', (e: any) => {
      if (isClosed) {
        return;
      }
      isClosed = true;
      if (e.wasClean) {
        observer.complete();
        serverResponseSubject$.complete();
      } else if (!e.wasClean) {
        observer.error('close error: not clean');
      }
    });

    /**
     * The event listener for the "message" event of the WebSocket connection.
     * It is called when a message is received from the WebSocket server.
     *
     * The message is emitted as a value of the serverResponseSubject$.
     */
    this.socket.on('response_event', (data: any) => {
      console.error('server responded data:', data);
      const response = {
        serverResponse: {
          result: 'success',
          ...data,
        },
      };
      serverResponseSubject$.next(response);
    });

    return (): void => {
      this.unsubscribe();
      if (!isClosed) {
        // clearTimeout(this.heartBeatTimer);
        // this.socket.removeHeartBeatListener(heartbeatListener);
        this.socket?.close();
      }
    };
  }

  private unsubscribe(): void {
    this.messagesStreamSubscription?.unsubscribe();
  }

  /**
   * This function is responsible for sending messages to the backend
   * by subscribing to the messagesStream$ stream and whenever this
   * stream gets an emission, the emitted value is sent to the
   * backend.
   *
   * @param messagesStream$ - a stream of messages to be sent to the backend
   */
  send(messagesStream$: Observable<any>) {
    this.messagesStreamSubscription = messagesStream$.subscribe((data) => {
      console.log('messagesStream:', data);
      this.socket?.send(data);
    });
  }
}
