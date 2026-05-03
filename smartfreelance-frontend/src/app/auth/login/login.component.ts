import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/serviceslogin/auth.service';
import { FaceLoginComponent } from '../../face-login/face-login.component';
import { AfterViewInit } from '@angular/core';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FaceLoginComponent],

  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']

})
export class LoginComponent implements OnInit, AfterViewInit {
  email: string = '';

  password: string = '';
  errorMessage: string = '';
  captchaToken: string = '';
  recaptchaWidgetId: any;


  constructor(private authService: AuthService, private router: Router) { }
  ngOnInit() {

}
ngAfterViewInit(): void {
      setTimeout(() => {
      if ((window as any).grecaptcha) {
        this.renderCaptcha();
      }
    }, 500);
  }
onFaceSuccess(res: any) {
  console.log("Face recognized ✅", res);

  // Save token
  this.authService.saveToken(res.token);

  // Save role
  const resolvedRole = this.authService.extractRoleFromLoginResponse(res);
  if (resolvedRole) {
    this.authService.saveRole(resolvedRole);
  }

  // Save userId
  const resolvedUserId = this.authService.extractUserIdFromLoginResponse(res);
  if (resolvedUserId) {
    this.authService.saveUserId(resolvedUserId);
  }

  // Redirect
  const role = resolvedRole ?? this.authService.getRole();

  if (role === 'ADMIN') {
    this.router.navigate(['/admin']);
  } else {
    this.router.navigate(['/projects']);
  }
}
onFaceError(error: string | Event) {
  if (typeof error === 'string') {
    this.errorMessage = error;
  } else {
    this.errorMessage = 'Face not recognized';
  }
}
login() {

  const token = (window as any).grecaptcha.getResponse(this.recaptchaWidgetId);


  if (!token) {
    this.errorMessage = "Please verify captcha";
    return;
  }

  this.captchaToken = token;



  this.authService.login({ email: this.email, password: this.password, captchaToken: this.captchaToken }).subscribe({
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

      }
    },
    error: (err: any) => {
      this.errorMessage = "Email ou mot de passe incorrect";
      console.error(err);
    }
  });
}

renderCaptcha() {
  const container = document.getElementById('recaptcha-container');

  if (!container) {
    console.error("❌ recaptcha container NOT FOUND");
    return;
  }

  this.recaptchaWidgetId = (window as any).grecaptcha.render(container, {
    sitekey: '6LcPusQsAAAAALxoeK1XXv6o_7BN8b_xqHTmEh7t',
    callback: (token: string) => {
      this.captchaToken = token;
      console.log("Captcha OK:", token);
    }
  });
}




}
