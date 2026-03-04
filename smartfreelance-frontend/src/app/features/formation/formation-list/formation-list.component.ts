import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormationService, PageResponse } from '../../../services/formation.service';
import { Formation } from '../../../models/formation.model';

@Component({
  selector: 'app-formation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formation-list.component.html',
  styleUrls: ['./formation-list.component.css']
})
export class FormationListComponent implements OnInit {
  formations: Formation[] = [];
  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;
  searchTerm = '';
  selectedLevel = '';
  levels: string[] = ['Débutant', 'Intermédiaire', 'Avancé'];

  constructor(private formationService: FormationService, private router: Router) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    if (this.searchTerm || this.selectedLevel) {
      this.formationService.searchFormations(
        { title: this.searchTerm, level: this.selectedLevel },
        this.currentPage,
        this.pageSize
      ).subscribe(this.handleResponse);
    } else {
      this.formationService.getFormationsPaged(this.currentPage, this.pageSize)
        .subscribe(this.handleResponse);
    }
  }

  private handleResponse = (data: PageResponse<Formation>) => {
    this.formations = data.content;
    this.totalElements = data.totalElements;
    this.totalPages = data.totalPages;
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadFormations();
  }

  onLevelChange(): void {
    this.currentPage = 0;
    this.loadFormations();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedLevel = '';
    this.currentPage = 0;
    this.loadFormations();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadFormations();
    }
  }

  viewDetails(id: number): void {
    this.router.navigate(['/formations', id]);
  }

  addFormation(): void {
    this.router.navigate(['/formations/new']);
  }
}