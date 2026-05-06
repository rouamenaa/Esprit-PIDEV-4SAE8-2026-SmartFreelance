import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/serviceslogin/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

        // Redirection selon le rôle
        const role = res.role;
        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (role === 'CLIENT') {
          this.router.navigate(['/utilisateur']);
        } else if (role === 'FREELANCER') {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/home']);
        }
      },
       error: (err: any) => { 
        this.errorMessage = "Email ou mot de passe incorrect";
        console.error(err);
      }
    });
  }
}