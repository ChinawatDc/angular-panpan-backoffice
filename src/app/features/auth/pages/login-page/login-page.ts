import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPageComponent {
  email = 'admin@panpan.dev';
  password = '1234';

  error = signal('');

  constructor(public auth: AuthService) { }

  async login() {
    this.error.set('');
    try {
      await this.auth.login(this.email, this.password);
    } catch {
      this.error.set('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  }
}
