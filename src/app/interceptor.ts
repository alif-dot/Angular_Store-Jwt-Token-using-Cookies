import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { catchError, Observable, of, throwError } from "rxjs";
import { AuthService } from "./services/auth.service";


@Injectable()
export class Interceptor implements HttpInterceptor {

    constructor(private inject: Injector, private router: Router, private _snackBar: MatSnackBar, private authService: AuthService) { }
    //let myCookies = document.cookie;

    ctr = 0

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // return next.handle(req).pipe(catchError(x=> this.handleAuthError(x)));
        //     var value = document.cookie;
        //     var parts = value.split("; " + "X-Access-Token" + "=");
        //    console.log(value);

        //     let tokenheader = req.clone({
        //         setHeaders: {
        //             Authorization: "bearer " + this.token
        //         }
        //     });

        //     return next.handle(tokenheader);

        const token = this.authService.getToken();

        if (token) {
            const cloned = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return next.handle(cloned);
        } else {
            return next.handle(req);
        }

        // const token = localStorage.getItem('X-Access-Token');

        // if (token) {
        //     const cloned = req.clone({
        //         setHeaders: {
        //             Authorization: `Bearer ${token}`,
        //         },
        //     });

        //     return next.handle(cloned);
        // } else {
        //     return next.handle(req);
        // }
    }


    // private handleAuthError(err: HttpErrorResponse): Observable<any> {
    //     if (err && err.status === 401 && this.ctr != 1) {
    //         this.ctr++
    //         let service = this.inject.get(AuthService);
    //         const username = service.getUsername();
    //         service.refreshToken().subscribe({
    //             next: (x: any) => {
    //                 this._snackBar.open("Tokens refreshed, try again");
    //                 return of("We refreshed the token now do again what u were trying to do");
    //             },
    //             error: (err: any) => {
    //                 service.revokeToken(username).subscribe({
    //                     next: (x: any) => {
    //                         this.router.navigateByUrl('/');
    //                         return of(err.message);
    //                     }
    //                 })
    //             }
    //         });
    //         return of("Attempting to Refresh Tokens");
    //     }
    //     else {
    //         this.ctr = 0
    //         return throwError(() => new Error("Non Authenticationn Error"));
    //     }

    // }
}