import {
  HttpErrorResponse,
  HttpEvent,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { ErrorHandler, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@aspnet/signalr';
import {
  Observable,
  catchError,
  combineLatest,
  map,
  switchMap,
  take,
} from 'rxjs';
import {
  ErrorResponseData,
  HTTPAdapter,
  ResponseData,
} from './Https.interface';

export const MASSART_VERSION_HEADER = 'massart-version';
export const MASSART_PLATFORM_HEADER = 'massart-platform';
export const MASSART_LOCALE_HEADER = 'massart-locale';

interface RawSuccessResponseData<T> {
  status: 'success';
  result: T;
  request_id?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MyHttp implements HTTPAdapter {
  constructor(
    private errorHandler: ErrorHandler,
    private http: HttpClient,
    private location: Location,
    private router: Router,
    // @Inject(HTTP_CONFIG)
    // private myHttpConfig MyHttpConfig,
    @Inject(HTTP_AUTH_PROVIDERS)
    private authProviders: readonly AuthServiceInterface[],
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private formateReponseBody<T, E>(
    response: HttpResponse<RawSuccessResponseData<T>>
  ): ResponseData<T, E | 'UNKONWN_ERROR'> {
    if (response.body === null) {
      console.error('No response body:', response);
      return {
        status: 'error',
        errorCode: 'UNKNOWN_ERROR',
      };
    }

    if (response.body.status !== 'success') {
      console.error('Malformed backend response', response.body);
      return {
        status: 'error',
        errorCode: 'UNKNOWN_ERROR',
      };
    }

    return {
      status: response.body.status,
      result: response.body.result,
      requestId: response.body.request_id,
    };
  }

  private formateErrorBody<E>(error: HttpErrorResponse): ErrorResponseData<E> {
    // If an error is found but no request it, most likely it is network issue
    if (
      error.error &&
      !error.error.request_id &&
      error.error.error === undefined
    ) {
      return {
        status: 'error',
        errorCode: 'NETWORK_ERROR',
      };
    }
    if (error.error && error.error.error !== undefined) {
      return {
        status: 'error',
        errorCode: error.error.error.code,
        requestId: error.error.request_id,
      };
    }

    return {
      status: 'error',
      errorCode: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Construct a GET request to the backend
   * @param endpoint The enpoint
   * @param options Request options
   */
  get<T = any, E = any>(
    endpoint: string,
    options?: unknown
  ): Observable<ResponseData<T, E | 'UNKNOWN_ERROR'>>;
  get<T = any, E = any>(
    endpoint: string,
    options?: unknown
  ): Observable<HttpEvent<ResponseData<T, E | 'UNKNOWN_ERROR'>>>;
  get<T = any, E = any>(
    endpoint: string,
    options: unknown = {}
  ):
    | Observable<ResponseData<T, E | 'UNKNOWN_ERROR'>>
    | Observable<HttpEvent<ResponseData<T, E | 'UNKNOWN_ERROR'>>> {
    const baseUrl = '';
    return this.getExtraHeaders().pipe(
      take(1),
      map((extraHeaders) => ({
        endpoint,
        extraHeaders,
      })),
      switchMap(({ endpoint: requestEndpoint, extraHeaders }) => {
        this.http.get<RawSuccessResponseData<T>>(
          `${baseUrl}/${requestEndpoint}`,
          {
            observe: 'response',
            params: options.params,
            withCredentials: options.withCredentials,
            headers: this.mergeExtraHeadersWithRequestHeaders(
              extraHeaders,
              options.headers
            ),
          }
        );
      }),
      map((event) => {
        if (event instanceof HttpResponse) {
          return event.clone({
            body: this.formateReponseBody<T, E>(event),
          });
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Get request error:', error);
      })
    );
  }

  private getExtraHeaders(): Observable<HttpHeaders[]> {
    return combineLatest([
      ...this.authProviders.map((p) => p.getAuthorizationHeader()),
    ]);
  }

  private mergeExtraHeadersWithRequestHeaders(
    extraHeadersArray: readonly HttpHeaders[],
    requestHeaders?: HttpHeaders
  ): HttpHeaders {
    let extraHeaders = new HttpHeaders();
    extraHeadersArray.forEach((headers) =>
      headers.keys().forEach((key) => {
        const values = headers.getAll(key);
        if (values) {
          extraHeaders = extraHeaders.append(key, values);
        }
      })
    );

    if (!requestHeaders) {
      return extraHeaders;
    }

    return extraHeaders.keys().reduce((obj, key) => {
      const values = extraHeaders.getAll(key);
      return values ? obj.append(key, values) : obj;
    }, requestHeaders);
  }
}
