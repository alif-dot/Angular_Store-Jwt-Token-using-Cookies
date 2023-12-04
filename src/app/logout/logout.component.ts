import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router,
    private service: AuthService,
    private _ngZone: NgZone,
    private http: HttpClient,
    private authService: AuthService) { }

  client: any = null
  colorList: string[] = [];

  ngOnInit(): void {
  }

  public logout() {
    const username = this.service.getUsername();
    //this.service.signOutExternal();
    this._ngZone.run(() => {
      this.service.revokeToken(username).subscribe({
        next: (x: any) => {
          this.router.navigate(['/']).then(() => window.location.reload());
        },
        error: (err: any) => {
          console.error(err);
          // Handle the error here, e.g., display an error message to the user
        },
      });
    });
  }

  public getRefreshed() {
    this.service.refreshToken().subscribe((res: any) => {
      console.log("tokens were refreshed")
    });

  }

  // public getList(){
  //   this.service.getClient().subscribe({
  //     next: (personObject:any) => {
  //       this.client = personObject

  //     },
  //     error: (err:any) =>{
  //       console.log(err)
  //     }
  //   });
  // }

  public getList() {
    const token = this.service.getToken();

    if (token) {
      console.log(token)
      const head_obj = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      //const httpHeaders = { headers:new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token}) };

      this.http.get('https://localhost:7374/GetColorList', { headers: head_obj }).subscribe({
        next: (personObject: any) => {
          this.client = personObject;
          console.log(personObject);

          console.log('Token from service:', this.service.getToken());
        },
        error: (err: any) => {
          console.log(err);
        }
      });
    } else {
      console.log('No token available.');
    }
  }

  // public getList(): Observable<any> {
  //   const token = localStorage.getItem('token');

  //   if (!token) {
  //     return new Observable();
  //   }

  //   const headers = new HttpHeaders({
  //     'Content-type': 'application/json',
  //     'Authorization': `Bearer ${token}`
  //   });

  //   // Make a request to refresh the token
  //   this.authService.refreshToken().subscribe({
  //     next: (refreshResponse: any) => {
  //       // Refresh was successful, now make the request to GetColorList
  //       this.http.get("https://localhost:7374/GetColorList", { headers }).subscribe({
  //         next: (colorList: any) => {
  //           // Process colorList
  //         },
  //         error: (colorListError: any) => {
  //           console.log(colorListError);
  //         }
  //       });
  //     },
  //     error: (refreshError: any) => {
  //       console.log(refreshError);
  //     }
  //   });

  //   return new Observable(); // Return observable for now, since the actual request is made in the refresh success callback.
  // }


  // public getList() {
  //   const token = localStorage.getItem('token');

  //   if (token) {
  //     const head_obj = new HttpHeaders().set('Authorization', 'Bearer ' + token);

  //     this.http.get('https://localhost:7374/GetColorList', { headers: head_obj }).subscribe({
  //       next: (personObject: any) => {
  //         this.client = personObject;
  //         console.log(personObject);
  //         console.log('Token from localStorage:', token);
  //       },
  //       error: (err: any) => {
  //         console.log(err);
  //       }
  //     });
  //   } else {
  //     console.log('No token available.');
  //   }
  // }  

}