import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { UsersApi } from '../../data-access/users.api';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Users,
  Search,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Plus,
  X,
} from 'lucide-angular';

type UserRow = { id: string; name: string; email: string; role: 'admin' | 'staff' };

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [UsersApi],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
})
export class UsersPage {
  // icons
  readonly UsersIcon = Users;
  readonly SearchIcon = Search;
  readonly RefreshIcon = RefreshCcw;
  readonly PrevIcon = ChevronLeft;
  readonly NextIcon = ChevronRight;
  readonly RoleIcon = ShieldCheck;
  readonly PlusIcon = Plus;
  readonly CloseIcon = X;

  loading = signal(false);
  error = signal('');
  q = signal('');
  page = signal(1);
  limit = 10;

  items = signal<UserRow[]>([]);
  total = signal(0);

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  canPrev = computed(() => this.page() > 1 && !this.loading());
  canNext = computed(() => this.page() < this.totalPages() && !this.loading());

  rangeText = computed(() => {
    const t = this.total();
    if (t === 0) return '0 results';
    const start = (this.page() - 1) * this.limit + 1;
    const end = Math.min(this.page() * this.limit, t);
    return `${start}-${end} of ${t}`;
  });

  // ===== Create Modal =====
  showCreate = signal(false);
  createLoading = signal(false);
  createError = signal('');

  formName = signal('');
  formEmail = signal('');
  formRole = signal<'admin' | 'staff'>('staff');

  constructor(private api: UsersApi) {
    this.load();
  }

  load() {
    this.error.set('');
    this.loading.set(true);

    this.api.list(this.q(), this.page(), this.limit).subscribe({
      next: (res) => {
        this.items.set(res.items as UserRow[]);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('โหลดผู้ใช้ไม่สำเร็จ');
        this.loading.set(false);
      },
    });
  }

  setQuery(v: string) {
    this.q.set(v);
  }

  search() {
    this.page.set(1);
    this.load();
  }

  reset() {
    this.q.set('');
    this.page.set(1);
    this.load();
  }

  next() {
    if (!this.canNext()) return;
    this.page.set(this.page() + 1);
    this.load();
  }

  prev() {
    if (!this.canPrev()) return;
    this.page.set(this.page() - 1);
    this.load();
  }

  // ===== Modal Actions =====
  openCreate() {
    this.createError.set('');
    this.formName.set('');
    this.formEmail.set('');
    this.formRole.set('staff');
    this.showCreate.set(true);
  }

  closeCreate() {
    if (this.createLoading()) return;
    this.showCreate.set(false);
  }

  async submitCreate() {
    this.createError.set('');

    const name = this.formName().trim();
    const email = this.formEmail().trim().toLowerCase();
    const role = this.formRole();

    if (!name) return this.createError.set('กรุณากรอกชื่อ');
    if (!email || !email.includes('@')) return this.createError.set('กรุณากรอกอีเมลให้ถูกต้อง');

    this.createLoading.set(true);

    this.api.create({ name, email, role }).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.showCreate.set(false);
        // refresh list เพื่อเห็น user ใหม่
        this.page.set(1);
        this.load();
      },
      error: (e) => {
        this.createLoading.set(false);
        this.createError.set(e?.error?.message ?? 'CREATE_FAILED');
      },
    });
  }
}
