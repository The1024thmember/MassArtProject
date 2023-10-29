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
import { environment } from '../environments/environment';
import { DatastoreModule } from './Datastore/datastore.module';
import { RequestDataModule } from './Datastore/request.module';
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
    DatastoreModule.initialize(environment.datastoreConfig),
    RequestDataModule, // need to check it its possible to add this inside datastore module
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
              environment.googleAccountClientId
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    },
    {
      provide: AUTH_CONFIG,
      useValue: {
        authHeaderName: 'massArt-auth',
        baseUrl: environment.baseUrl,
        authHashCookie: 'MASSART_HASH', // JWT token
        userIdCookie: 'MASSART_USER_ID', // UserId
      },
    },
    CookieService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
