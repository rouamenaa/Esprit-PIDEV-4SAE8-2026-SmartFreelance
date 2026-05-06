import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  freelancers: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.searchApiUrl}/freelancers`).subscribe({
      next: (data) => {
        // Map backend FreelancerProfile to home component display structure
        this.freelancers = data.map(f => ({
          name: f.firstName + ' ' + f.lastName,
          skill: f.title || 'Freelancer',
          price: f.hourlyRate || 0
        }));
        
        // If no data from backend, fallback to some mock data for better UI
        if (this.freelancers.length === 0) {
           this.freelancers = [
              { name: 'Ali Dev', skill: 'Angular Developer', price: 25 },
              { name: 'Sara UI', skill: 'UI/UX Designer', price: 30 },
              { name: 'John JS', skill: 'Fullstack Developer', price: 40 }
           ];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching freelancers', err);
        // Fallback in case of error
        this.freelancers = [
          { name: 'Ali Dev', skill: 'Angular Developer', price: 25 },
          { name: 'Sara UI', skill: 'UI/UX Designer', price: 30 },
          { name: 'John JS', skill: 'Fullstack Developer', price: 40 }
        ];
        this.loading = false;
      }
    });
  }
}