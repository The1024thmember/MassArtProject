import { SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { HeadingType } from 'src/app/ComponentLibrary/MyHeading';
import { Auth } from 'src/app/Services/BackendServices/AuthService/Auth.service';
@Component({
  selector: 'app-google-login',
  template: `<div class="" id="google-button"></div>`,
})
export class GoogleLoginComponent implements OnInit {
  HeadingType = HeadingType;
  user?: SocialUser;
  google: any;
  constructor(private http: HttpClient, private auth: Auth) {}

  ngOnInit(): void {
    // @ts-ignore
    google.accounts.id.initialize({
      client_id:
        '330531838931-l4lcnk4bc6nlu7fiamr6isvllutnf9iq.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    // @ts-ignore
    google.accounts.id.renderButton(
      // @ts-ignore
      document.getElementById('google-button'),
      { theme: 'outline', size: 'large', width: '100%' }
    );
    // @ts-ignore
    google.accounts.id.prompt((notification: PromptMomentNotification) => {});
  }

  async handleCredentialResponse(response: any) {
    // Here will be your response from Google.
    console.log(response);
    this.verifyToken(response.credential);
  }

  verifyToken(token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    const payload = { token: token };
    this.http
      .post(
        'https://backend-api.massart.gallery/api/u/verify_token',
        payload,
        httpOptions
      )
      .subscribe((response) => {
        console.log('response:', response);
        this.auth.setSession('123', token);
      });
    this.http
      .post(
        'https://backend-api.massart.gallery/api/u/test',
        payload,
        httpOptions
      )
      .subscribe((response) => {
        console.log('response:', response);
        this.auth.setSession('123', token);
      });
  }
}
