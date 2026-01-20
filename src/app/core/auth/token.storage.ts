export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
};

const KEY = 'pp_auth_tokens';

export class TokenStorage {
  static get(): AuthTokens | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthTokens;
    } catch {
      return null;
    }
  }

  static set(tokens: AuthTokens) {
    localStorage.setItem(KEY, JSON.stringify(tokens));
  }

  static clear() {
    localStorage.removeItem(KEY);
  }
}
