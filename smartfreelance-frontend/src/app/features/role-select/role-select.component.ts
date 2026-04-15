import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-role-select',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './role-select.component.html',
  styleUrls: ['./role-select.component.css']
})
export class RoleSelectComponent {
  selectedRole: string = '';

  constructor(private router: Router) {}

  selectRole(role: string) {
    this.selectedRole = role;
  }

  continue() {
    if (this.selectedRole) {
      this.router.navigate(['/utilisateur'], {
        queryParams: { role: this.selectedRole }
      });
    }
  }
}