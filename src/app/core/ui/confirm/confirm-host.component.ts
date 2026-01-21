import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="confirm.state() as s">
      <div class="confirm-backdrop" (click)="confirm.cancel()"></div>
      <div class="confirm-modal" role="dialog" aria-modal="true">
        <div class="confirm-head">
          <div class="confirm-title">{{ s.title }}</div>
          <button class="icon-btn" (click)="confirm.cancel()" aria-label="Close">
            ✕
          </button>
        </div>
        <div class="confirm-body">{{ s.message }}</div>
        <div class="confirm-actions">
          <button class="btn ghost" (click)="confirm.cancel()">{{ s.cancelText }}</button>
          <button class="btn" [class.danger]="s.danger" (click)="confirm.confirm()">
            {{ s.okText }}
          </button>
        </div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .confirm-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        z-index: 1000;
      }

      .confirm-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(420px, 92vw);
        border-radius: 16px;
        background: #ffffff;
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.25);
        border: 1px solid rgba(15, 23, 42, 0.08);
        padding: 16px;
        z-index: 1001;
        animation: confirm-in 160ms ease-out;
      }

      .confirm-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .confirm-title {
        font-weight: 600;
        color: #0f172a;
      }

      .confirm-body {
        margin-top: 10px;
        color: #334155;
      }

      .confirm-actions {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .btn {
        border: 1px solid rgba(15, 23, 42, 0.1);
        background: #0f172a;
        color: #ffffff;
        padding: 8px 12px;
        border-radius: 10px;
        cursor: pointer;
      }

      .btn.ghost {
        background: transparent;
        color: #0f172a;
      }

      .btn.danger {
        background: #dc2626;
        border-color: rgba(220, 38, 38, 0.6);
      }

      .icon-btn {
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 16px;
        color: #475569;
      }

      @keyframes confirm-in {
        from {
          transform: translate(-50%, -52%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, -50%);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ConfirmHostComponent {
  constructor(readonly confirm: ConfirmService) {}
}
