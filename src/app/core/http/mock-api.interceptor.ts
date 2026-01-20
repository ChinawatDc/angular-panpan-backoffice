import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError, delay } from 'rxjs';
import { ENV } from '../config/env';
import { TokenStorage } from '../auth/token.storage';

const MOCK_USER = {
  id: 'u_1',
  email: 'admin@panpan.dev',
  name: 'Panpan Admin',
  roles: ['admin'],
};

function unauthorized(msg = 'UNAUTHORIZED') {
  return throwError(
    () =>
      new HttpErrorResponse({
        status: 401,
        statusText: msg,
        error: { message: msg },
      })
  );
}

export const mockApiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  // mock เฉพาะ /api/*
  if (!req.url.startsWith(ENV.apiBaseUrl)) return next(req);

  // ===== helper: check auth =====
  const tokens = TokenStorage.get();
  const authHeader = req.headers.get('Authorization') ?? '';
  const hasBearer = authHeader.startsWith('Bearer ');
  const tokenLooksOk = authHeader.includes('access_');

  // mock server rule: ถ้า token หมดอายุ -> 401
  const isExpired = !tokens || tokens.expiresAt <= Date.now();

  // ===== Routes =====

  // GET /api/health (public)
  if (req.method === 'GET' && req.url === `${ENV.apiBaseUrl}/health`) {
    return of(new HttpResponse({ status: 200, body: { ok: true, ts: Date.now() } })).pipe(delay(150));
  }

  // GET /api/me (protected)
  if (req.method === 'GET' && req.url === `${ENV.apiBaseUrl}/me`) {
    if (!hasBearer || !tokenLooksOk) return unauthorized('NO_TOKEN');
    if (isExpired) return unauthorized('TOKEN_EXPIRED');

    return of(new HttpResponse({ status: 200, body: MOCK_USER })).pipe(delay(250));
  }

  // GET /api/dashboard/summary (protected)
  if (req.method === 'GET' && req.url === `${ENV.apiBaseUrl}/dashboard/summary`) {
    if (!hasBearer || !tokenLooksOk) return unauthorized('NO_TOKEN');
    if (isExpired) return unauthorized('TOKEN_EXPIRED');

    return of(
      new HttpResponse({
        status: 200,
        body: {
          status: 'OK',
          mode: 'Day 3 Mock API',
          serverTime: new Date().toISOString(),
          activeUsers: 12,
        },
      })
    ).pipe(delay(300));
  }

  // Unknown mock route -> 404
  return throwError(
    () =>
      new HttpErrorResponse({
        status: 404,
        statusText: 'MOCK_NOT_FOUND',
        error: { message: 'MOCK_NOT_FOUND', url: req.url },
      })
  );
};
