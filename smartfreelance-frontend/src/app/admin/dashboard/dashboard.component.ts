import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/serviceslogin/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userRole: string | null = null;
  isFreelancer = false;
  isClient = false;
  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    this.isFreelancer = this.userRole === 'FREELANCER';
    this.isClient = this.userRole === 'CLIENT';
    this.isAdmin = this.userRole === 'ADMIN';
  }
}
