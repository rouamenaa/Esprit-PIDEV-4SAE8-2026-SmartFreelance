import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  isDark = true; // thème par défaut

  toggleSidebar() {
    // à connecter avec la sidebar
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    if(this.isDark){
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }
  
}
