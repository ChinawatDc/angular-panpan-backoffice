import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MockAuthApi, UserProfile } from './mock-auth.api';
import { TokenStorage, AuthTokens } from './token.storage';

type AuthState = {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  loading: boolean;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = new MockAuthApi();

  private state = signal<AuthState>({
    user: null,
    tokens: TokenStorage.get(),
    loading: false,
  });

  user = computed(() => this.state().user);
  tokens = computed(() => this.state().tokens);
  isAuthenticated = computed(() => {
    const t = this.state().tokens;
    return !!t && t.expiresAt > Date.now();
  });
  roles = computed(() => this.state().user?.roles ?? []);
  loading = computed(() => this.state().loading);

  constructor(private router: Router) { }

  async initFromStorage() {
    const tokens = TokenStorage.get();
    if (!tokens) return;

    // ถ้าหมดอายุแล้ว ลอง refresh
    if (tokens.expiresAt <= Date.now()) {
      try {
        await this.refreshAccessToken();
      } catch {
        this.logout();
        return;
      }
    }

    // โหลด me
    try {
      const me = await firstValueFrom(this.api.me(TokenStorage.get()!.accessToken));
      this.state.update((s) => ({ ...s, user: me }));
    } catch {
      this.logout();
    }
  }

  async login(email: string, password: string) {
    this.state.update((s) => ({ ...s, loading: true }));
    try {
      const res = await firstValueFrom(this.api.login({ email, password }));
      const tokens: AuthTokens = {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        expiresAt: Date.now() + res.expiresInSec * 1000,
      };
      TokenStorage.set(tokens);
      this.state.set({ user: res.user, tokens, loading: false });
      await this.router.navigateByUrl('/admin');
    } catch (e) {
      this.state.update((s) => ({ ...s, loading: false }));
      throw e;
    }
  }

  logout() {
    TokenStorage.clear();
    this.state.set({ user: null, tokens: null, loading: false });
    this.router.navigateByUrl('/login');
  }

  getAccessToken(): string | null {
    return TokenStorage.get()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return TokenStorage.get()?.refreshToken ?? null;
  }

  isAccessExpired(): boolean {
    const t = TokenStorage.get();
    if (!t) return true;
    return t.expiresAt <= Date.now();
  }

  async refreshAccessToken(): Promise<void> {
    const tokens = TokenStorage.get();
    if (!tokens?.refreshToken) throw new Error('NO_REFRESH_TOKEN');

    const res = await firstValueFrom(this.api.refresh(tokens.refreshToken));
    const next: AuthTokens = {
      ...tokens,
      accessToken: res.accessToken,
      expiresAt: Date.now() + res.expiresInSec * 1000,
    };
    TokenStorage.set(next);
    this.state.update((s) => ({ ...s, tokens: next }));
  }

  hasAnyRole(required: string[]): boolean {
    if (required.length === 0) return true;
    const userRoles = this.roles();
    return required.some((r) => userRoles.includes(r));
  }
}
