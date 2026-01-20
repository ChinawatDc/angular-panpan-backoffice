import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, from, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { ENV } from '../config/env';

let refreshInFlight: Promise<void> | null = null;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const auth = inject(AuthService);

  // intercept เฉพาะ apiBaseUrl
  const isApi = req.url.startsWith(ENV.apiBaseUrl);
  if (!isApi) return next(req);

  const token = auth.getAccessToken();
  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((err: unknown) => {
      const httpErr = err as HttpErrorResponse;
      if (httpErr?.status !== 401) return throwError(() => err);

      // ถ้าไม่มี refresh token -> logout
      if (!auth.getRefreshToken()) {
        auth.logout();
        return throwError(() => err);
      }

      // refresh แบบกันยิงซ้อน
      if (!refreshInFlight) {
        refreshInFlight = auth.refreshAccessToken().finally(() => {
          refreshInFlight = null;
        });
      }

      return from(refreshInFlight).pipe(
        switchMap(() => {
          const newToken = auth.getAccessToken();
          if (!newToken) {
            auth.logout();
            return throwError(() => err);
          }
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(retryReq);
        })
      );
    })
  );
};
