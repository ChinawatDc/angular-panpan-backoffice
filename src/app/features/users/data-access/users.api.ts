import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENV } from '../../../core/config/env';

export type CreateUserDto = { name: string; email: string; role: 'admin' | 'staff' };

export class UsersApi {
  private http = inject(HttpClient);

  list(q = '', page = 1, limit = 10) {
    const params = new HttpParams()
      .set('q', q)
      .set('page', page)
      .set('limit', limit);

    return this.http.get<{
      items: any[];
      total: number;
      page: number;
      limit: number;
    }>(`${ENV.apiBaseUrl}/users`, { params });
  }

  create(dto: CreateUserDto) {
    return this.http.post(`${ENV.apiBaseUrl}/users`, dto);
  }
}
