import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersApi, UserRow, UserRole } from '../../data-access/users.api';
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
  Mail,
  User,
  Pencil,
  Trash2,
  TriangleAlert,
} from 'lucide-angular';

type Mode = 'create' | 'edit';

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
  readonly MailIcon = Mail;
  readonly UserIcon = User;

  readonly EditIcon = Pencil;
  readonly DeleteIcon = Trash2;
  readonly WarnIcon = TriangleAlert;

  loading = signal(false);
  error = signal('');
  q = signal('');
  page = signal(1);
  limit = 10;

  items = signal<UserRow[]>([]);
  total = signal(0);

  // modal (create/edit)
  modalOpen = signal(false);
  modalMode = signal<Mode>('create');
  saving = signal(false);
  formError = signal('');
  editingId = signal<string>('');
  form = {
    name: '',
    email: '',
    role: 'staff' as UserRole,
  };

  // delete confirm
  deleteOpen = signal(false);
  deleting = signal(false);
  deleteError = signal('');
  deleteTarget = signal<UserRow | null>(null);

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

  constructor(private api: UsersApi) {
    this.load();
  }

  load() {
    this.error.set('');
    this.loading.set(true);

    this.api.list(this.q(), this.page(), this.limit).subscribe({
      next: (res) => {
        this.items.set(res.items);
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

  // ===== Create/Edit Modal =====
  openCreate() {
    this.modalMode.set('create');
    this.editingId.set('');
    this.formError.set('');
    this.form = { name: '', email: '', role: 'staff' };
    this.modalOpen.set(true);
  }

  openEdit(u: UserRow) {
    this.modalMode.set('edit');
    this.editingId.set(u.id);
    this.formError.set('');
    this.form = { name: u.name, email: u.email, role: u.role };
    this.modalOpen.set(true);
  }

  closeModal() {
    if (this.saving()) return;
    this.modalOpen.set(false);
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  submitModal() {
    this.formError.set('');

    const name = this.form.name.trim();
    const email = this.form.email.trim().toLowerCase();
    const role = this.form.role;

    if (!name) return this.formError.set('กรุณากรอกชื่อ');
    if (!email || !this.isValidEmail(email)) return this.formError.set('อีเมลไม่ถูกต้อง');

    this.saving.set(true);

    const mode = this.modalMode();
    const req$ =
      mode === 'create'
        ? this.api.create({ name, email, role })
        : this.api.update(this.editingId(), { name, email, role });

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.load();
      },
      error: (e) => {
        this.saving.set(false);
        this.formError.set(e?.error?.message ?? (mode === 'create' ? 'CREATE_FAILED' : 'UPDATE_FAILED'));
      },
    });
  }

  // ===== Delete Confirm =====
  openDelete(u: UserRow) {
    this.deleteError.set('');
    this.deleteTarget.set(u);
    this.deleteOpen.set(true);
  }

  closeDelete() {
    if (this.deleting()) return;
    this.deleteOpen.set(false);
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;

    this.deleteError.set('');
    this.deleting.set(true);

    this.api.remove(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteOpen.set(false);

        // ถ้าลบแล้วหน้าว่าง (เช่นอยู่หน้าสุดท้าย) ให้ถอยหน้ากลับแบบฉลาด
        const remain = Math.max(0, this.total() - 1);
        const maxPageAfter = Math.max(1, Math.ceil(remain / this.limit));
        if (this.page() > maxPageAfter) this.page.set(maxPageAfter);

        this.load();
      },
      error: (e) => {
        this.deleting.set(false);
        this.deleteError.set(e?.error?.message ?? 'DELETE_FAILED');
      },
    });
  }
}
