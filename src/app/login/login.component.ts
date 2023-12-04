import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { credentialRes, PromptMomentNotification } from 'ng-google-one-tap';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';

declare const FB: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form = this.fb.group({
    username: ['', Validators.email],
    password: ['', Validators.required]
  });

  private clientId = environment.clientId

  constructor(
    private router: Router,
    private service: AuthService,
    private _ngZone: NgZone,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar) { }

    ngOnInit(): void {

      // @ts-ignore
      window.onGoogleLibraryLoad = () => {
        // @ts-ignore
        google.accounts.id.initialize({
          client_id: this.clientId,
          callback: this.handleCredentialResponse.bind(this),
          auto_select: false,
          cancel_on_tap_outside: true
        });
        // @ts-ignore
        google.accounts.id.renderButton(
        // @ts-ignore
        document.getElementById("buttonDiv"),
          { theme: "outline", size: "large", width: "100%" } 
        );
        // @ts-ignore
        google.accounts.id.prompt((_notification: PromptMomentNotification) => {});
      };
    }

    async handleCredentialResponse(response: credentialRes) {
      await this.service.LoginWithGoogle(response.credential).subscribe(
        (x:any) => {
          this._ngZone.run(() => {
            this.router.navigate(['/logout']);
          })},
        (error:any) => {
            console.log(error);
          }
        );  
  }

  // async onSubmit() {
  //   if (this.form.valid) {
  //     try {
  //       this.service.login(this.form.value).subscribe((response: any) => {
  //         console.log(response);
          
  //         // Save token and username in service
  //         this.service.saveToken(response.token);
  //         this.service.saveUsername(response.username);
  
  //         this.router.navigate(['/logout']);
  //         this._snackBar.open("Login Successful", "Close", {
  //           duration: 200000
  //         });         
  //       },
  //       (error: any) => {
  //         console.error(error);
  //         this._snackBar.open("Error with Username or Password", "Close", {
  //           duration: 500000
  //         });
  //       });
  //     } catch (err) {
  //       this._snackBar.open("Error with Username or Password", "Close", {
  //         duration: 500000
  //       });
  //     }
  //   } else {
  //     // Handle form validation error if needed
  //   }
  // }  

  onSubmit() {
    if (this.form.valid) {
      try {
        this.service.login(this.form.value).subscribe((response: any) => {
          let token = response.token;
          localStorage.setItem('token', token);
          this.router.navigate(['/logout']);
          this._snackBar.open("Login Successful", "Close", { duration: 2000 });
        }, (error: any) => {
          console.error(error);
          this._snackBar.open("Error with Username or Password", "Close", { duration: 5000 });
        });
      } catch (err) {
        this._snackBar.open("Error with Username or Password", "Close", { duration: 5000 });
      }
    }
  }

  async login() {
    FB.login(async (result:any) => {
        await this.service.LoginWithFacebook(result.authResponse.accessToken).subscribe(
          (x:any) => {
            this._ngZone.run(() => {
              this.router.navigate(['/logout']);
            })},
          (error:any) => {
              console.log(error);
            }
          );  
    }, { scope: 'email' });
    
  }
}