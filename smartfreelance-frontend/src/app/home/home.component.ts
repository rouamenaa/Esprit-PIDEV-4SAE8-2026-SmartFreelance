import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  freelancers = [
    { name: 'Ali Dev',  skill: 'Angular Developer',  price: 25 },
    { name: 'Sara UI',  skill: 'UI/UX Designer',      price: 30 },
    { name: 'John JS',  skill: 'Fullstack Developer', price: 40 },
  ];

  goTo(path: string) {
    this.router.navigate([path]);
  }
}