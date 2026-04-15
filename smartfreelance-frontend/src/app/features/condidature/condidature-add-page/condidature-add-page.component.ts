import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CondidatureAddComponent } from '../condidature-add/condidature-add.component';

@Component({
  selector: 'app-condidature-add-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CondidatureAddComponent],
  templateUrl: './condidature-add-page.component.html',
  styleUrl: './condidature-add-page.component.css',
})
export class CondidatureAddPageComponent {
  constructor(private router: Router) {}

  onClose(): void {
    this.router.navigate(['/condidatures']);
  }
}
