import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error';

export type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
  durationMs: number;
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private itemsSignal = signal<ToastItem[]>([]);
  readonly items = this.itemsSignal.asReadonly();

  success(message: string, durationMs = 2500) {
    this.push('success', message, durationMs);
  }

  error(message: string, durationMs = 3000) {
    this.push('error', message, durationMs);
  }

  private push(kind: ToastKind, message: string, durationMs: number) {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const item: ToastItem = { id, kind, message, durationMs };

    this.itemsSignal.update((list) => [...list, item]);

    setTimeout(() => {
      this.itemsSignal.update((list) => list.filter((t) => t.id !== id));
    }, durationMs);
  }
}
