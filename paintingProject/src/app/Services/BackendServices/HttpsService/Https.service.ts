import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { ErrorHandler, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  combineLatest,
  map,
  of,
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

export interface RequestOptions {
  params?: HttpParams;
  withCredentials?: boolean;
  headers?: HttpHeaders;
}

@Injectable({
  providedIn: 'root',
})
export class MyHttp implements HTTPAdapter {
  BASE_URL = '';
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
  ): ResponseData<T, E | 'UNKNOWN_ERROR'> {
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
    options?: RequestOptions
  ): Observable<ResponseData<T, E | 'UNKNOWN_ERROR'>>;
  get<T = any, E = any>(
    endpoint: string,
    options?: RequestOptions
  ): Observable<HttpEvent<ResponseData<T, E | 'UNKNOWN_ERROR'>>>;
  get<T = any, E = any>(
    endpoint: string,
    options: RequestOptions = {}
  ):
    | Observable<ResponseData<T, E | 'UNKNOWN_ERROR'>>
    | Observable<HttpEvent<ResponseData<T, E | 'UNKNOWN_ERROR'>>> {
    const baseUrl = this.BASE_URL;
    return this.getExtraHeaders().pipe(
      take(1),
      map((extraHeaders) => ({
        endpoint,
        extraHeaders,
      })),
      switchMap(({ endpoint: requestEndpoint, extraHeaders }) =>
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
        )
      ),
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
        return of(1).pipe(
          map(
            () =>
              new HttpResponse<ErrorResponseData<E | 'UNKNOWN_ERROR'>>({
                body: this.formateErrorBody(error),
              })
          )
        );
      })
    );
  }

  /**
   * Construct a POST request to the backend
   * @param endpoint The enpoint
   * @param body Request body
   * @param options Request options
   */
  post<T, E>(
    endpoint: string,
    body: any | null,
    options?: RequestOptions
  ): Observable<ResponseData<T, E | 'UNKNOWN_ERROR'>>;
  post<T, E>(
    endpoint: string,
    body: any | null,
    options?: RequestOptions
  ): Observable<HttpEvent<ResponseData<T, E | 'UNKNOWN_ERROR'>>>;
  post<T = any, E = any>(
    endpoint: string,
    body: any | null,
    options: RequestOptions = {}
  ):
    | Observable<ResponseData<T, E | 'UNKNOWN_ERROR'>>
    | Observable<HttpEvent<ResponseData<T, E | 'UNKNOWN_ERROR'>>> {
    const baseUrl = this.BASE_URL;
    const requestBody = body;

    return this.getExtraHeaders().pipe(
      take(1),
      map((extraHeaders) => ({
        endpoint,
        extraHeaders,
      })),
      switchMap(({ endpoint: requestEndpoint, extraHeaders }) =>
        this.http.post<RawSuccessResponseData<T>>(
          `${baseUrl}/${requestEndpoint}`,
          requestBody,
          {
            observe: 'response',
            params: options.params,
            withCredentials: options.withCredentials,
            headers: this.mergeExtraHeadersWithRequestHeaders(
              extraHeaders,
              options.headers
            ),
          }
        )
      ),
      map((event) => this.formateReponseBody<T, E>(event)),
      catchError((error: HttpErrorResponse) => {
        console.error('Get request error:', error);
        return of(1).pipe(
          map(
            () =>
              new HttpResponse<ErrorResponseData<E | 'UNKNOWN_ERROR'>>({
                body: this.formateErrorBody(error),
              })
          )
        );
      })
    );
  }

  /**
   * Construct a PUT request to the backend
   * @param endpoint The enpoint
   * @param body Request body
   * @param options Request options
   */
  put<T, E>(
    endpoint: string,
    body: any | null,
    options?: RequestOptions
  ): Observable<ResponseData<T, E | 'UNKNOWN_ERROR'>>;
  put<T, E>(
    endpoint: string,
    body: any | null,
    options?: RequestOptions
  ): Observable<HttpEvent<ResponseData<T, E | 'UNKNOWN_ERROR'>>>;
  put<T = any, E = any>(
    endpoint: string,
    body: any | null,
    options: RequestOptions = {}
  ):
    | Observable<ResponseData<T, E | 'UNKNOWN_ERROR'>>
    | Observable<HttpEvent<ResponseData<T, E | 'UNKNOWN_ERROR'>>> {
    const baseUrl = this.BASE_URL;
    const requestBody = body;

    return this.getExtraHeaders().pipe(
      take(1),
      map((extraHeaders) => ({
        endpoint,
        extraHeaders,
      })),
      switchMap(({ endpoint: requestEndpoint, extraHeaders }) =>
        this.http.put<RawSuccessResponseData<T>>(
          `${baseUrl}/${requestEndpoint}`,
          requestBody,
          {
            observe: 'response',
            params: options.params,
            withCredentials: options.withCredentials,
            headers: this.mergeExtraHeadersWithRequestHeaders(
              extraHeaders,
              options.headers
            ),
          }
        )
      ),
      map((event) => this.formateReponseBody<T, E>(event)),
      catchError((error: HttpErrorResponse) => {
        console.error('Get request error:', error);
        return of(1).pipe(
          map(
            () =>
              new HttpResponse<ErrorResponseData<E | 'UNKNOWN_ERROR'>>({
                body: this.formateErrorBody(error),
              })
          )
        );
      })
    );
  }

  /**
   * Construct a DELETE request to the backend
   * @param endpoint The enpoint
   * @param options Request options
   */
  delete<T, E>(
    endpoint: string,
    options?: RequestOptions
  ): Observable<ResponseData<T, E | 'UNKNOWN_ERROR'>>;
  delete<T, E>(
    endpoint: string,
    options?: RequestOptions
  ): Observable<HttpEvent<ResponseData<T, E | 'UNKNOWN_ERROR'>>>;
  delete<T = any, E = any>(
    endpoint: string,
    options: RequestOptions = {}
  ):
    | Observable<ResponseData<T, E | 'UNKNOWN_ERROR'>>
    | Observable<HttpEvent<ResponseData<T, E | 'UNKNOWN_ERROR'>>> {
    const baseUrl = this.BASE_URL;

    return this.getExtraHeaders().pipe(
      take(1),
      map((extraHeaders) => ({
        endpoint,
        extraHeaders,
      })),
      switchMap(({ endpoint: requestEndpoint, extraHeaders }) =>
        this.http.delete<RawSuccessResponseData<T>>(
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
        )
      ),
      map((event) => this.formateReponseBody<T, E>(event)),
      catchError((error: HttpErrorResponse) => {
        console.error('Get request error:', error);
        return of(1).pipe(
          map(
            () =>
              new HttpResponse<ErrorResponseData<E | 'UNKNOWN_ERROR'>>({
                body: this.formateErrorBody(error),
              })
          )
        );
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
