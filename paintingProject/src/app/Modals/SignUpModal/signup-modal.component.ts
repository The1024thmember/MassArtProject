import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Auth } from 'src/app/Services/BackendServices/AuthService/Auth.service';
@Component({
  selector: 'signup-modal',
  template: ` <div class="" id="google-button"></div>`,
})
export class SignupModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<SignupModalComponent>,
    private http: HttpClient,
    private auth: Auth
  ) {}

  ngOnInit() {
    console.log('dialogRef:', this.dialogRef);
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
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    const payload = { token: token };
    // for production use https://backend-api.massart.gallery/api/u/sign_in
    // for dev use http://127.0.0.1:5001/u/sign_in
    this.http
      .post(
        'https://backend-api.massart.gallery/api/u/sign_in',
        payload,
        httpOptions
      )
      .subscribe((response: any) => {
        console.log('response:', response);
        const jwtToken = response.jwt;
        console.log('jwtToken from response:', jwtToken);
        this.auth.setSession('123', jwtToken);
        sessionStorage.setItem('jwtToken', jwtToken);

        const getJwtToken = sessionStorage.getItem('jwtToken');
        console.log('jwtToken:', jwtToken);
        const headers = new HttpHeaders().set(
          'Authorization',
          `${getJwtToken}`
        );
        // for production use https://backend-api.massart.gallery/api/u/test
        // for dev use http://127.0.0.1:5001/u/test
        this.http
          .post('https://backend-api.massart.gallery/api/u/test', payload, {
            headers,
          })
          .subscribe((response: any) => {
            console.log('response:', response);
            const jwtToken = response.jwt;
          });
      });
  }

  // When the user clicks the action button a.k.a. the logout button in the\
  // modal, show an alert and followed by the closing of the modal
  actionFunction() {
    alert('You have logged out.');
    this.closeModal();
  }

  // If the user clicks the cancel button a.k.a. the go back button, then\
  // just close the modal
  closeModal() {
    this.dialogRef.close();
  }
}
