import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENV } from '../../../core/config/env';
import { UserFormPayload, UserRow } from '../users.types';

export class UsersApi {
  private http = inject(HttpClient);

  list(q = '', page = 1, limit = 10) {
    const params = new HttpParams()
      .set('q', q)
      .set('page', page)
      .set('limit', limit);

    return this.http.get<{
      items: UserRow[];
      total: number;
      page: number;
      limit: number;
    }>(`${ENV.apiBaseUrl}/users`, { params });
  }

  create(payload: UserFormPayload) {
    return this.http.post<UserRow>(`${ENV.apiBaseUrl}/users`, payload);
  }

  update(id: string, payload: UserFormPayload) {
    return this.http.put<UserRow>(`${ENV.apiBaseUrl}/users/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<{ ok: true }>(`${ENV.apiBaseUrl}/users/${id}`);
  }
}
