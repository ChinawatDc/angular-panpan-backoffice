import { Observable, of, throwError, delay } from 'rxjs';

export type LoginRequest = { email: string; password: string };
export type UserProfile = { id: string; email: string; name: string; roles: string[] };

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresInSec: number;
  user: UserProfile;
};

export class MockAuthApi {
  // mock user
  private user: UserProfile = {
    id: 'u_1',
    email: 'admin@panpan.dev',
    name: 'Panpan Admin',
    roles: ['admin'],
  };

  // เก็บ refresh token ที่ valid แบบง่าย ๆ
  private validRefreshTokens = new Set<string>();

  login(body: LoginRequest): Observable<LoginResponse> {
    // demo credential
    if (body.email === 'admin@panpan.dev' && body.password === '1234') {
      const accessToken = this.makeToken('access');
      const refreshToken = this.makeToken('refresh');
      this.validRefreshTokens.add(refreshToken);

      return of({
        accessToken,
        refreshToken,
        expiresInSec: 10, // ให้หมดอายุเร็วเพื่อทดสอบ refresh
        user: this.user,
      }).pipe(delay(400));
    }
    return throwError(() => ({ status: 401, message: 'INVALID_CREDENTIALS' })).pipe(delay(400));
  }

  refresh(refreshToken: string): Observable<{ accessToken: string; expiresInSec: number }> {
    if (!this.validRefreshTokens.has(refreshToken)) {
      return throwError(() => ({ status: 401, message: 'REFRESH_INVALID' })).pipe(delay(300));
    }
    return of({
      accessToken: this.makeToken('access'),
      expiresInSec: 10,
    }).pipe(delay(300));
  }

  me(accessToken: string): Observable<UserProfile> {
    // mock validate accessToken แบบง่าย ๆ
    if (!accessToken?.includes('access_')) {
      return throwError(() => ({ status: 401, message: 'ACCESS_INVALID' })).pipe(delay(200));
    }
    return of(this.user).pipe(delay(200));
  }

  private makeToken(prefix: 'access' | 'refresh') {
    return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }
}
