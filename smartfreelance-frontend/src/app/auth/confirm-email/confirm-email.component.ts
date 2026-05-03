import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
  const token = this.route.snapshot.queryParamMap.get('token');

  console.log("TOKEN =", token); // debug

  if (!token) {
    this.status = 'error';
    return;
  }

  this.http.get(`http://localhost:8085/auth/confirm?token=${token}`)
    .subscribe({
      next: (res) => {
        console.log("CONFIRM SUCCESS", res);
        this.status = 'success';
      },
      error: (err) => {
        console.error("CONFIRM ERROR", err);
        this.status = 'error';
      }
    });
}

  goLogin() { this.router.navigate(['/login']); }
}