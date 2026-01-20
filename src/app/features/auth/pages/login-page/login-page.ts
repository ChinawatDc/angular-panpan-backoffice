import { Component } from '@angular/core';
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

  error = '';

  constructor(public auth: AuthService) { }

  async login() {
    this.error = '';
    try {
      await this.auth.login(this.email, this.password);
      // auth.login จะ navigate ไป /admin อยู่แล้ว
    } catch {
      this.error = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    }
  }
}
