import { InjectionToken } from '@angular/core';

export interface AuthConfig {
  authHeaderName: string;
  baseUrl: string;
  authHashCookie: string; // JWT token
  userIdCookie: string; // UserId
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AuthConfig');
