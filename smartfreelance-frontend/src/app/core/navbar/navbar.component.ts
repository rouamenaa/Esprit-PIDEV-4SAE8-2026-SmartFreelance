import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  @Output() sidebarToggle = new EventEmitter<void>();
  isDark = true; // thème par défaut

  toggleSidebar() {
    this.sidebarToggle.emit();
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
