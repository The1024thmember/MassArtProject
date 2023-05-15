import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import {
  BehaviorSubject,
  Observable,
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import { isDefined } from 'src/app/Helpers';
import { AUTH_CONFIG, AuthConfig } from './Auth.config';
import { AuthServiceInterface, AuthState } from './Auth.interface';

export class Auth implements AuthServiceInterface {
  private isInitialized: boolean;
  private beforeLogoutActions: (() => Promise<void>)[] = [];
  private _authStateSubject$ = new BehaviorSubject<AuthState | undefined>(
    undefined
  );
  private authStateLocked = false; // Indicating if the auth state is currently changing

  get authState$(): Observable<AuthState | undefined> {
    if (!this.isInitialized) {
      this.init();
    }
    return this._authStateSubject$.asObservable().pipe(
      filter(() => !this.authStateLocked),
      distinctUntilChanged()
    );
  }

  constructor(
    private cookies: CookieService,
    private http: HttpClient,
    @Inject(AUTH_CONFIG) private authConfig: AuthConfig
  ) {}

  private init() {
    // get user id and token
    let userId = this.cookies.get(this.authConfig.userIdCookie);
    let token = this.cookies.get(this.authConfig.authHashCookie);

    if (userId && token) {
      this._authStateSubject$.next({ userId, token });
    }

    this.isInitialized = true;
  }

  getUserId(): Observable<string> {
    if (!this.isInitialized) {
      this.init();
    }
    return this.authState$.pipe(
      filter(isDefined),
      map((auth) => auth.userId)
    );
  }

  isLoggedIn(): Observable<boolean> {
    if (!this.isInitialized) {
      this.init();
    }
    return this.authState$.pipe(map((state) => !!state));
  }

  /**
   *
   * Register an action to be ran before logging hte user out, allowing authenticated
   * calls to be made before the auth state is reset
   */
  registerBeforeLogoutAction(action: () => Promise<void>): void {
    if (!this.isInitialized) {
      this.init();
    }
    this.beforeLogoutActions.push(action);
  }

  logout(): Observable<undefined> {
    if (!this.isInitialized) {
      this.init();
    }
    return this.authState$.pipe(
      take(1),
      switchMap(async (auth) => {
        if (!auth) {
          throw new Error('no user to logout');
        }

        await Promise.all(this.beforeLogoutActions.map((action) => action()));

        this.authStateLocked = true;
        const body = new FormData();
        body.append('user', auth.userId);
        body.append('token', auth.token);
        return this.http
          .post(`${this.authConfig.baseUrl}/logout/`, body)
          .pipe(take(1));
      }),
      map(() => undefined),
      finalize(() => {
        this.authStateLocked = false;
        this._authStateSubject$.next(undefined);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof Error) {
          throw error.error;
        }

        console.error(error.message, error.error);
        return of(undefined);
      })
    );
  }

  setSession(userId: string, token: string): void {
    if (!this.isInitialized) {
      this.init();
    }
    this._authStateSubject$.next({ userId, token });
  }

  deleteSession(): void {
    if (!this.isInitialized) {
      this.init();
    }
    this._authStateSubject$.next(undefined);
  }
}
