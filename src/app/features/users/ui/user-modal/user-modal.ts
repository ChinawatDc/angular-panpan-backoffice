import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserFormPayload, UserRole, UserRow } from '../../users.types';
import {
  LucideAngularModule,
  Plus,
  X,
  Mail,
  User,
  Pencil,
  ShieldCheck,
} from 'lucide-angular';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.scss',
})
export class UserModalComponent implements OnChanges {
  @Input() open = false;
  @Input() mode: Mode = 'create';
  @Input() initial: UserRow | null = null;
  @Input() saving = false;
  @Input() error = '';
  @Output() submit = new EventEmitter<UserFormPayload>();
  @Output() closed = new EventEmitter<void>();

  readonly PlusIcon = Plus;
  readonly CloseIcon = X;
  readonly MailIcon = Mail;
  readonly UserIcon = User;
  readonly EditIcon = Pencil;
  readonly RoleIcon = ShieldCheck;

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    role: new FormControl<UserRole>('staff', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.resetForm();
    }
    if (changes['initial'] && this.open) {
      this.resetForm();
    }
  }

  close() {
    if (this.saving) return;
    this.closed.emit();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submit.emit(this.form.getRawValue());
  }

  private resetForm() {
    if (this.mode === 'edit' && this.initial) {
      this.form.reset({
        name: this.initial.name,
        email: this.initial.email,
        role: this.initial.role,
      });
    } else {
      this.form.reset({ name: '', email: '', role: 'staff' });
    }
  }
}
