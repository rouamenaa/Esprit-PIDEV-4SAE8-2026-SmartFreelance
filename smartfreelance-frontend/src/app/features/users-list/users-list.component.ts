import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/serviceslogin/auth.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = true;
  searchQuery = '';
  selectedRole: string = '';
  selectedStatus: string = '';
  sortBy: string = 'username';
  isAdmin = false;
  actionLoading: Record<number, boolean> = {};

  roles = ['FREELANCER', 'CLIENT'];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    this.loadUsers();
  }

  get totalProjects(): number {
    return this.users.reduce((acc, u) => acc + (u.totalProjects || 0), 0);
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers()
      .subscribe({
        next: (res: any) => {
          const result = res as any[];
          this.users = result.filter(user => user.role !== 'ADMIN');
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.bio && user.bio.toLowerCase().includes(query))
      );
    }

    // Apply role filter
    if (this.selectedRole) {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    // Apply status filter (for admins)
    if (this.isAdmin && this.selectedStatus) {
      filtered = filtered.filter(user => this.getUserStatus(user) === this.selectedStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'projects':
          return (b.totalProjects || 0) - (a.totalProjects || 0);
        case 'recent':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default: // username
          return a.username.localeCompare(b.username);
      }
    });

    this.filteredUsers = filtered
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onRoleChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  getActiveUsersCount(): number {
    return this.users.filter(user => this.getUserStatus(user) === 'ACTIVE').length;
  }

  getRoleClass(role: string): string {
    return role === 'FREELANCER' ? 'badge-info' : 'badge-warning';
  }

  getProfilePercentage(user: any): number {
    return user.profileCompletion || 0;
  }

  goToReview(user: any): void {
    this.router.navigate(['/review', user.id, user.role]);
  }

  getUserStatus(user: any): string {
    return user.status ? user.status.toUpperCase() : 'ACTIVE';
  }

  banUser(user: any): void {
    this.actionLoading[user.id] = true;
    this.userService.ban(user.id).subscribe({
      next: () => {
        user.status = 'BANNED';
        this.actionLoading[user.id] = false;
      },
      error: (err) => {
        console.error('Ban user failed:', err);
        this.actionLoading[user.id] = false;
      }
    });
  }

  suspendUser(user: any): void {
    this.actionLoading[user.id] = true;
    this.userService.suspend(user.id).subscribe({
      next: () => {
        user.status = 'SUSPENDED';
        this.actionLoading[user.id] = false;
      },
      error: (err) => {
        console.error('Suspend user failed:', err);
        this.actionLoading[user.id] = false;
      }
    });
  }

  activateUser(user: any): void {
    this.actionLoading[user.id] = true;
    this.userService.activate(user.id).subscribe({
      next: () => {
        user.status = 'ACTIVE';
        this.actionLoading[user.id] = false;
      },
      error: (err) => {
        console.error('Activate user failed:', err);
        this.actionLoading[user.id] = false;
      }
    });
  }
}
