// import { HttpEvent } from '@angular/common/http';
// import { Observable } from 'rxjs';

// export interface MyHttpConfig {
//   baseUrl: string;
// }

// // T is a generic type, it is a type parameter that represents the actual data payload of the response
// export interface SuccessResponseData<T> {
//   readonly status: 'success';
//   readonly result: T;
//   readonly requestId?: string;
// }

// export type ErrorResponseData<E> = BackendErrorResponse<E>;

// export type ResponseData<T, E> = SuccessResponseData<T> | ErrorResponseData<E>;

// export interface BackendSuccessReponse {
//   readonly status: 'success';
// }

// export interface BackendErrorResponse<E> {
//   readonly status: 'error';
//   readonly errorCode: E | 'UNKNOWN_ERROR' | 'NETWORK_ERROR';
//   readonly requestId?: string;
// }

// export interface HttpAdapter {
//   get<T, E>(
//     endpoint: string,
//     options?: unknown
//   ): Observable<ResponseData<T, E>>;
//   get<T, E>(
//     endpoint: string,
//     options?: unknown
//   ): Observable<HttpEvent<ResponseData<T, E>>>;

//   post<T, E>(
//     endpoint: string,
//     body: any | null,
//     options?: unknown
//   ): Observable<ResponseData<T, E>>;
//   post<T, E>(
//     endpoint: string,
//     body: any | null,
//     options?: unknown
//   ): Observable<HttpEvent<ResponseData<T, E>>>;

//   put<T, E>(
//     endpoint: string,
//     body: any | null,
//     options?: unknown
//   ): Observable<ResponseData<T, E>>;
//   put<T, E>(
//     endpoint: string,
//     body: any | null,
//     options?: unknown
//   ): Observable<HttpEvent<ResponseData<T, E>>>;

//   delete<T, E>(
//     endpoint: string,
//     options?: unknown
//   ): Observable<ResponseData<T, E>>;
//   delete<T, E>(
//     endpoint: string,
//     options?: unknown
//   ): Observable<HttpEvent<ResponseData<T, E>>>;
// }
