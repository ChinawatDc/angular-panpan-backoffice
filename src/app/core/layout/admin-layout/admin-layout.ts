import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { LucideAngularModule, Shield, LayoutDashboard, LogOut, Users } from 'lucide-angular';
import { FooterComponent } from '../../../shared/footer/footer';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, FooterComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit {
  // icons
  readonly ShieldIcon = Shield;
  readonly DashboardIcon = LayoutDashboard;
  readonly LogoutIcon = LogOut;
  readonly UsersIcon = Users;
  constructor(public auth: AuthService) { }

  ngOnInit() {
    this.auth.initFromStorage();
  }

  logout() {
    this.auth.logout();
  }
}
