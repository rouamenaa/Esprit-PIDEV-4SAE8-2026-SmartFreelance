import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/serviceslogin/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  isDark = true;

  constructor(private authService: AuthService, private router: Router) {}

  toggleSidebar() {}

  toggleTheme() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }
<<<<<<< HEAD
  
}
=======

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
  
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
