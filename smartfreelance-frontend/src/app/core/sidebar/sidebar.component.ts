// sidebar.component.ts
import { Component } from '@angular/core';
<<<<<<< HEAD
=======
import { CommonModule } from '@angular/common';
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25



import { RouterModule } from '@angular/router';
import { AuthService } from '../serviceslogin/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],

})
export class SidebarComponent {
  isCollapsed = false; 
  openMenu: string = ''; 

  constructor(private authService: AuthService) {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMenu(menu: string) {
    this.openMenu = this.openMenu === menu ? '' : menu;
  }

  get role(): string | null {
    return this.authService.getRole();
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isClient(): boolean {
    return this.role === 'CLIENT';
  }

  isFreelancer(): boolean {
    return this.role === 'FREELANCER';
  }
}
