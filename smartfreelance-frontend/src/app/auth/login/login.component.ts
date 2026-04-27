import { Component } from '@angular/core';
<<<<<<< HEAD
import { Router } from '@angular/router';
=======
import { Router, RouterModule } from '@angular/router';
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/serviceslogin/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, FormsModule],
=======
  imports: [CommonModule, FormsModule, RouterModule], 

>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
<<<<<<< HEAD
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);

        // Redirection selon le rôle
        const role = res.role;
        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (role === 'CLIENT') {
          this.router.navigate(['/utilisateur']);
        } else if (role === 'FREELANCER') {
          this.router.navigate(['/freelancer']);
        } else {
          this.router.navigate(['/home']);
=======
  this.authService.login({ email: this.email, password: this.password }).subscribe({
    next: (res: any) => {
      this.authService.saveToken(res.token);
      const resolvedRole = this.authService.extractRoleFromLoginResponse(res);
      if (resolvedRole) {
        this.authService.saveRole(resolvedRole);
      }
      const resolvedUserId = this.authService.extractUserIdFromLoginResponse(res);
      if (resolvedUserId) {
        this.authService.saveUserId(resolvedUserId);
      }

      // 🔍 Debug — vérifiez ce que contient le token
      console.log('res.role:', res.role);
      console.log('role from token:', this.authService.getRole());

      const role = resolvedRole ?? this.authService.getRole();
        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (role === 'CLIENT') {
          this.router.navigate(['/projects']);
        } else if (role === 'FREELANCER') {
          this.router.navigate(['/projects']);
        } else {
          this.router.navigate(['']);

>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
        }
      },
       error: (err: any) => { 
        this.errorMessage = "Email ou mot de passe incorrect";
        console.error(err);
      }
    });
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
