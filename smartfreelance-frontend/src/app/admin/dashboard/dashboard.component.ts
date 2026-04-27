import { Component } from '@angular/core';
<<<<<<< HEAD
=======
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25

@Component({
  selector: 'app-dashboard',
  standalone: true,
<<<<<<< HEAD
  imports: [],
=======
  imports: [CommonModule, RouterModule],
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
