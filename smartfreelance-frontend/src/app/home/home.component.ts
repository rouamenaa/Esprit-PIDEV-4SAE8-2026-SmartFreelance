import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  freelancers = [
  { name: 'Ali Dev', skill: 'Angular Developer', price: 25 },
  { name: 'Sara UI', skill: 'UI/UX Designer', price: 30 },
  { name: 'John JS', skill: 'Fullstack Developer', price: 40 }
];


}
