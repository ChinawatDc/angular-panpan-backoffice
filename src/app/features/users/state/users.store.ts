import { Injectable, computed, signal } from '@angular/core';
import { UserRow } from '../users.types';

export type UsersState = {
  loading: boolean;
  items: UserRow[];
  page: number;
  total: number;
  q: string;
  error: string;
};

@Injectable()
export class UsersStore {
  private state = signal<UsersState>({
    loading: false,
    items: [],
    page: 1,
    total: 0,
    q: '',
    error: '',
  });

  readonly loading = computed(() => this.state().loading);
  readonly items = computed(() => this.state().items);
  readonly page = computed(() => this.state().page);
  readonly total = computed(() => this.state().total);
  readonly q = computed(() => this.state().q);
  readonly error = computed(() => this.state().error);

  setState(partial: Partial<UsersState>) {
    this.state.update((s) => ({ ...s, ...partial }));
  }
}
