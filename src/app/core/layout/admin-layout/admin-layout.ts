import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit {
  constructor(public auth: AuthService) { }

  ngOnInit() {
    // ✅ ทำให้ refresh หน้า /admin แล้วยังอยู่ได้
    this.auth.initFromStorage();
  }

  logout() {
    this.auth.logout();
  }
}
