import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

interface User {
  UserName: string;
  Token: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginStatus = new BehaviorSubject<boolean>(this.loggedIn())
  private username = new BehaviorSubject<string>(localStorage.getItem('username')!)
  private path = environment.apiUrl
  http: any;

  constructor(private httpClient: HttpClient) { }

  public signOutExternal = () => {
    localStorage.removeItem("token");
    console.log("token deleted")
  }

  LoginWithGoogle(credentials: string): Observable<any> {
    const header = new HttpHeaders().set('Content-type', 'application/json');
    return this.httpClient.post(this.path + "LoginWithGoogle", JSON.stringify(credentials), { headers: header, withCredentials: true });
  }

  LoginWithFacebook(credentials: string): Observable<any> {
    const header = new HttpHeaders().set('Content-type', 'application/json');
    return this.httpClient.post(this.path + "LoginWithFacebook", JSON.stringify(credentials), { headers: header, withCredentials: true });
  }

  login(loginModel: any): Observable<any> {
    const header = new HttpHeaders().set('Content-type', 'application/json');

    return this.httpClient.post<any>(this.path + 'Login', JSON.stringify(loginModel), { headers: header, withCredentials: true })
      .pipe(
        tap((response: any) => {
          this.saveToken(response.token);
          this.saveUsername(response.username);
        })
      );
  }

  getTokenFromStorage(): string {
    return localStorage.getItem('token') || '';
  }

  getClient(): Observable<any> {
    const header = new HttpHeaders().set('Content-type', 'application/json');
    return this.httpClient.get(this.path + "GetColorList", { headers: header, withCredentials: true });
  }

  // refreshToken(): Observable<any> {
  //   const header = new HttpHeaders().set('Content-type', 'application/json');
  //   return this.httpClient.get(this.path + "RefreshToken", { headers: header, withCredentials: true });
  // }

  refreshToken(): Observable<any> {
    const header = new HttpHeaders().set('Content-type', 'application/json');
    return this.httpClient.get(this.path + "RefreshToken", { headers: header, withCredentials: true })
      .pipe(
        tap((response: any) => {
          console.log('Refresh Token Response:', response);

          if (response && response.accessToken) {
            this.saveToken(response.accessToken);
            // Optionally, update the refresh token in storage
            // localStorage.setItem('X-Refresh-Token', response.refreshToken);
          } else {
            console.error('Invalid response structure from the server:', response);
          }
        })
      );
  }


  public revokeToken(username: string): Observable<any> {
    const url = `${this.path}/RevokeToken/${username}`;
    return this.http.delete(url);
  }

  public getUsername(): string {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).username : '';
  }

  saveUsername(username: string) {
    localStorage.setItem('username', username)
  }

  loggedIn(): boolean {
    if (localStorage.getItem('token')) {
      return true;
    }
    return false;
  }

  setLoginStatus(val: any) {
    this.loginStatus.next(val)
  }

  setUsername(val: any) {
    this.username.next(val)
  }

  getToken(): string | null {
    const tokenString = localStorage.getItem('X-Access-Token');
    console.log(tokenString);
    if (tokenString) {
      const token = (tokenString);
      return token
    }
    return null;
  }

  saveToken(token: any): void {
    const tokenString = token.token;
    localStorage.setItem('X-Access-Token', tokenString);
  }

  // Function to make authenticated API calls
  public getList(): Observable<any> {
    const token = localStorage.getItem('X-Access-Token');

    if (!token) {
      return new Observable();
    }

    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.httpClient.get("https://localhost:7374/GetColorList", { headers });
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (token) {
      // Decode the token to check expiration
      const decodedToken = this.decodeToken(token);
      if (decodedToken && decodedToken.exp) {
        // Check if the current time is before the expiration time
        return decodedToken.exp * 100000 > Date.now();
      }
    }
    return false;
  }

  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}