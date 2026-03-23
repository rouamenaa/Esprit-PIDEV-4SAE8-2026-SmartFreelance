import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/serviceslogin/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 

  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
  this.authService.login({ email: this.email, password: this.password }).subscribe({
    next: (res: any) => {
      this.authService.saveToken(res.token);
      this.authService.saveRole(res.role);

      // 🔍 Debug — vérifiez ce que contient le token
      console.log('res.role:', res.role);
      console.log('role from token:', this.authService.getRole());

      const role = res.role;
        if (role === 'ADMIN') {
          this.router.navigate(['/profil-freelancer']);
        } else if (role === 'CLIENT') {
          this.router.navigate(['/projects']);
        } else if (role === 'FREELANCER') {
          this.router.navigate(['/profil-freelancer']);
        } else {
          this.router.navigate(['']);

        }
      },
       error: (err: any) => { 
        this.errorMessage = "Email ou mot de passe incorrect";
        console.error(err);
      }
    });
  }
}