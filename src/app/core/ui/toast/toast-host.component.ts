import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" *ngIf="toast.items().length > 0">
      <div
        class="toast"
        *ngFor="let t of toast.items()"
        [class.success]="t.kind === 'success'"
        [class.error]="t.kind === 'error'"
        role="status"
        aria-live="polite"
      >
        {{ t.message }}
      </div>
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
      }

      .toast {
        min-width: 220px;
        padding: 10px 14px;
        border-radius: 10px;
        color: #0f172a;
        background: #ffffff;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
        border: 1px solid rgba(15, 23, 42, 0.08);
        animation: toast-in 150ms ease-out;
      }

      .toast.success {
        border-color: rgba(22, 163, 74, 0.4);
        background: #f0fdf4;
        color: #14532d;
      }

      .toast.error {
        border-color: rgba(220, 38, 38, 0.35);
        background: #fef2f2;
        color: #7f1d1d;
      }

      @keyframes toast-in {
        from {
          transform: translateY(-6px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ToastHostComponent {
  constructor(readonly toast: ToastService) {}
}
