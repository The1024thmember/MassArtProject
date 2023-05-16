import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  GoogleLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from 'angularx-social-login';
import { CookieModule } from 'ngx-cookie';
import { CookieService } from 'ngx-cookie-service';
import { AUTH_CONFIG } from './Services/BackendServices/AuthService/Auth.config';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CookieModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SocialLoginModule,
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '330531838931-l4lcnk4bc6nlu7fiamr6isvllutnf9iq.apps.googleusercontent.com' // TODO: Adding all this value to environment.ts file
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    },
    {
      provide: AUTH_CONFIG,
      useValue: {
        authHeaderName: 'massArt-auth',
        baseUrl: 'http://localhost:4200/',
        authHashCookie: 'MASSART_HASH', // JWT token
        userIdCookie: 'MASSART_USER_ID', // UserId
      },
    },
    CookieService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
