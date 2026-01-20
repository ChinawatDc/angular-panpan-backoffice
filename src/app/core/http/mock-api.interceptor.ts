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

function unauthorized(msg = 'UNAUTHORIZED'): Observable<never> {
  return throwError(
    () =>
      new HttpErrorResponse({
        status: 401,
        statusText: msg,
        error: { message: msg },
      })
  );
}

function notFound(url: string): Observable<never> {
  return throwError(
    () =>
      new HttpErrorResponse({
        status: 404,
        statusText: 'MOCK_NOT_FOUND',
        error: { message: 'MOCK_NOT_FOUND', url },
      })
  );
}

export const mockApiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // mock เฉพาะ /api/*
  if (!req.url.startsWith(ENV.apiBaseUrl)) return next(req);

  const tokens = TokenStorage.get();
  const authHeader = req.headers.get('Authorization') ?? '';
  const hasBearer = authHeader.startsWith('Bearer ');
  const tokenLooksOk = authHeader.includes('access_');
  const isExpired = !tokens || tokens.expiresAt <= Date.now();

  const requireAuth = () => {
    if (!hasBearer || !tokenLooksOk) return unauthorized('NO_TOKEN');
    if (isExpired) return unauthorized('TOKEN_EXPIRED');
    return null; // OK
  };

  // ===== Routes =====

  // GET /api/health (public)
  if (req.method === 'GET' && req.url === `${ENV.apiBaseUrl}/health`) {
    return of(
      new HttpResponse({
        status: 200,
        body: { ok: true, ts: Date.now() },
      })
    ).pipe(delay(150));
  }

  // GET /api/me (protected)
  if (req.method === 'GET' && req.url === `${ENV.apiBaseUrl}/me`) {
    const err = requireAuth();
    if (err) return err;

    return of(new HttpResponse({ status: 200, body: MOCK_USER })).pipe(delay(200));
  }

  // GET /api/dashboard/summary (protected)
  if (req.method === 'GET' && req.url === `${ENV.apiBaseUrl}/dashboard/summary`) {
    const err = requireAuth();
    if (err) return err;

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
    ).pipe(delay(250));
  }

  // GET /api/users (protected) - server-side paging/search
  if (req.method === 'GET' && req.url.startsWith(`${ENV.apiBaseUrl}/users`)) {
    const err = requireAuth();
    if (err) return err;

    const params = req.params;
    const q = (params.get('q') ?? '').toLowerCase();
    const page = +(params.get('page') ?? 1);
    const limit = +(params.get('limit') ?? 10);

    const all = Array.from({ length: 42 }).map((_, i) => ({
      id: `u_${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@demo.dev`,
      role: i % 3 === 0 ? 'admin' : 'staff',
    }));

    const filtered = all.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const start = (safePage - 1) * safeLimit;
    const items = filtered.slice(start, start + safeLimit);

    return of(
      new HttpResponse({
        status: 200,
        body: {
          items,
          total: filtered.length,
          page: safePage,
          limit: safeLimit,
        },
      })
    ).pipe(delay(300));
  }

  // Unknown mock route -> 404 (สำคัญ: ต้อง return เสมอ)
  return notFound(req.url);
};
