import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Contrat } from '../../../models/Contract';
import { ContratService } from '../../../services/contrat.service';
import { ContractEditComponent } from '../contract-edit/contract-edit.component';

@Component({
  selector: 'app-contract-edit-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ContractEditComponent],
  templateUrl: './contract-edit-page.component.html',
  styleUrl: './contract-edit-page.component.css',
})
export class ContractEditPageComponent implements OnInit {
  id: number | null = null;
  contrat: Contrat | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contratService: ContratService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const idNum = idParam ? parseInt(idParam, 10) : NaN;
    if (!idParam || isNaN(idNum)) {
      this.error = 'Identifiant invalide';
      this.loading = false;
      return;
    }
    this.id = idNum;
    this.contratService.getById(idNum).subscribe({
      next: (c) => {
        this.contrat = c;
        this.loading = false;
      },
      error: () => {
        this.error = 'Contrat introuvable';
        this.loading = false;
      },
    });
  }

  onClose(): void {
    if (this.id != null) {
      this.router.navigate(['/contrats', this.id]);
    } else {
      this.router.navigate(['/contrats']);
    }
  }
}
