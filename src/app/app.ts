import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmHostComponent } from './core/ui/confirm/confirm-host.component';
import { ToastHostComponent } from './core/ui/toast/toast-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastHostComponent, ConfirmHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('panpan-backoffice');
}
