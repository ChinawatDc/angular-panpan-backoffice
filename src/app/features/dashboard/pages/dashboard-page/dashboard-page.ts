import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ENV } from '../../../../core/config/env';

type Me = { id: string; email: string; name: string; roles: string[] };
type Summary = { status: string; mode: string; serverTime: string; activeUsers: number };

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPageComponent implements OnInit {
  loading = signal(false);
  error = signal<string>('');

  me = signal<Me | null>(null);
  summary = signal<Summary | null>(null);

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.error.set('');
    this.loading.set(true);

    // ยิง 2 endpoint (แบบแยกง่าย ๆ)
    this.http.get<Me>(`${ENV.apiBaseUrl}/me`).subscribe({
      next: (v) => this.me.set(v),
      error: (e) => this.error.set(e?.error?.message ?? 'ME_ERROR'),
    });

    this.http.get<Summary>(`${ENV.apiBaseUrl}/dashboard/summary`).subscribe({
      next: (v) => this.summary.set(v),
      error: (e) => this.error.set(e?.error?.message ?? 'SUMMARY_ERROR'),
      complete: () => this.loading.set(false),
    });
  }
}
