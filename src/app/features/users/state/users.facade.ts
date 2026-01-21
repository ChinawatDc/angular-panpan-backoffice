import { Injectable, computed, inject, signal } from '@angular/core';
import { UsersApi } from '../data-access/users.api';
import { UserFormPayload, UserRow } from '../users.types';
import { UsersStore } from './users.store';
import { normalizeApiError } from '../../../core/http/api-error';
import { ToastService } from '../../../core/ui/toast/toast.service';
import { ConfirmService } from '../../../core/ui/confirm/confirm.service';

type Mode = 'create' | 'edit';

@Injectable()
export class UsersFacade {
  private readonly api = inject(UsersApi);
  private readonly store = inject(UsersStore);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  private readonly limit = 10;
  private editing = signal<UserRow | null>(null);

  readonly modalOpen = signal(false);
  readonly modalMode = signal<Mode>('create');
  readonly saving = signal(false);
  readonly formError = signal('');

  // ✅ ตอนนี้ store พร้อมแล้ว
  readonly loading = this.store.loading;
  readonly items = this.store.items;
  readonly page = this.store.page;
  readonly total = this.store.total;
  readonly q = this.store.q;
  readonly error = this.store.error;

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly canPrev = computed(() => this.page() > 1 && !this.loading());
  readonly canNext = computed(() => this.page() < this.totalPages() && !this.loading());
  readonly rangeText = computed(() => {
    const t = this.total();
    if (t === 0) return '0 results';
    const start = (this.page() - 1) * this.limit + 1;
    const end = Math.min(this.page() * this.limit, t);
    return `${start}-${end} of ${t}`;
  });

  readonly editTarget = computed(() => this.editing());

  constructor() {
    this.load();
  }

  load() {
    this.store.setState({ error: '', loading: true });
    this.api.list(this.q(), this.page(), this.limit).subscribe({
      next: (res) => {
        this.store.setState({
          items: res.items,
          total: res.total,
          loading: false,
          error: '',
        });
      },
      error: (err) => {
        const apiError = normalizeApiError(err);
        this.store.setState({ error: apiError.message, loading: false });
        this.toast.error(apiError.message);
      },
    });
  }

  setQuery(v: string) {
    this.store.setState({ q: v });
  }

  search() {
    this.store.setState({ page: 1 });
    this.load();
  }

  reset() {
    this.store.setState({ q: '', page: 1 });
    this.load();
  }

  next() {
    if (!this.canNext()) return;
    this.store.setState({ page: this.page() + 1 });
    this.load();
  }

  prev() {
    if (!this.canPrev()) return;
    this.store.setState({ page: this.page() - 1 });
    this.load();
  }

  openCreate() {
    this.modalMode.set('create');
    this.editing.set(null);
    this.formError.set('');
    this.modalOpen.set(true);
  }

  openEdit(u: UserRow) {
    this.modalMode.set('edit');
    this.editing.set(u);
    this.formError.set('');
    this.modalOpen.set(true);
  }

  closeModal() {
    if (this.saving()) return;
    this.modalOpen.set(false);
  }

  submit(payload: UserFormPayload) {
    this.formError.set('');
    this.saving.set(true);

    const mode = this.modalMode();
    if (mode === 'edit' && !this.editing()) {
      this.saving.set(false);
      this.formError.set('Missing user to edit');
      return;
    }

    const req$ =
      mode === 'create'
        ? this.api.create(payload)
        : this.api.update(this.editing()!.id, payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.toast.success(mode === 'create' ? 'User created' : 'User updated');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        const apiError = normalizeApiError(err);
        this.formError.set(apiError.message);
        this.toast.error(apiError.message);
      },
    });
  }

  async requestDelete(u: UserRow) {
    const ok = await this.confirm.open({
      title: 'Delete user',
      message: `Delete ${u.name} (${u.email})?`,
      okText: 'Delete',
      danger: true,
    });
    if (!ok) return;

    this.api.remove(u.id).subscribe({
      next: () => {
        const remain = Math.max(0, this.total() - 1);
        const maxPageAfter = Math.max(1, Math.ceil(remain / this.limit));
        if (this.page() > maxPageAfter) this.store.setState({ page: maxPageAfter });
        this.toast.success('User deleted');
        this.load();
      },
      error: (err) => {
        const apiError = normalizeApiError(err);
        this.toast.error(apiError.message);
      },
    });
  }
}
