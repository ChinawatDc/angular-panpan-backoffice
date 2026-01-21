import { Injectable, signal } from '@angular/core';

export type ConfirmOptions = {
  title: string;
  message: string;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmState = {
  title: string;
  message: string;
  okText: string;
  cancelText: string;
  danger: boolean;
  resolve: (value: boolean) => void;
};

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private stateSignal = signal<ConfirmState | null>(null);
  readonly state = this.stateSignal.asReadonly();

  open(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.stateSignal.set({
        title: options.title,
        message: options.message,
        okText: options.okText ?? 'OK',
        cancelText: options.cancelText ?? 'Cancel',
        danger: options.danger ?? false,
        resolve,
      });
    });
  }

  confirm() {
    const current = this.stateSignal();
    if (!current) return;
    this.stateSignal.set(null);
    current.resolve(true);
  }

  cancel() {
    const current = this.stateSignal();
    if (!current) return;
    this.stateSignal.set(null);
    current.resolve(false);
  }
}
