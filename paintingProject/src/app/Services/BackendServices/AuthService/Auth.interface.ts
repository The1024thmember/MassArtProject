import { Observable } from 'rxjs';

export interface RawAuthResponseData<T> {
  status: string;
  result: T;
  request_id?: string;
}

export interface AuthState {
  userId: string;
  token: string;
}

export interface AuthServiceInterface {
  authState$: Observable<AuthState | undefined>;
  getUserId(): Observable<string>;
  isLoggedIn(): Observable<boolean>;
  logout(): Observable<undefined>;
  setSession(userId: string, token: string): void;
  deleteSession(): void;
}
