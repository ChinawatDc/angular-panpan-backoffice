import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UsersFacade } from '../../state/users.facade';
import { UsersStore } from '../../state/users.store';
import { UsersApi } from '../../data-access/users.api';
import { UserRow } from '../../users.types';
import { UserModalComponent } from '../../ui/user-modal/user-modal';
import {
  LucideAngularModule,
  Users,
  Search,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-angular';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UserModalComponent],
  providers: [UsersApi, UsersStore, UsersFacade],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
})
export class UsersPage {
  readonly UsersIcon = Users;
  readonly SearchIcon = Search;
  readonly RefreshIcon = RefreshCcw;
  readonly PrevIcon = ChevronLeft;
  readonly NextIcon = ChevronRight;
  readonly RoleIcon = ShieldCheck;

  readonly PlusIcon = Plus;
  readonly EditIcon = Pencil;
  readonly DeleteIcon = Trash2;

  constructor(readonly facade: UsersFacade) { }

  trackById(_: number, u: UserRow) {
    return u.id;
  }
}
