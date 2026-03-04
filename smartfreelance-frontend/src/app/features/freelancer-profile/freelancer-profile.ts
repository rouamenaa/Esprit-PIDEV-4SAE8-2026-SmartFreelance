import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FreelancerService } from '../../services/freelancer-profile';
import { FreelancerProfile } from '../../models/freelancer-profile.model';

@Component({
  standalone: true,
  selector: 'app-freelancer-profile',
  templateUrl: './freelancer-profile.html',
  styleUrls: ['./freelancer-profile.css'],
  imports: [CommonModule, FormsModule]
})
export class FreelancerProfileComponent implements OnInit {

  // Formulaire pour créer / modifier
  freelancer: FreelancerProfile = this.emptyForm();

  // Profil chargé depuis la base
  existingProfile: FreelancerProfile | null = null;

  isEditMode: boolean = false;
  currentUserId: number = 1; // TODO: Récupérer depuis auth/session

  successMessage: string = '';
  errorMessage: string = '';

  constructor(private freelancerService: FreelancerService) {}

  ngOnInit() {
    this.loadProfile();
  }

  // ✅ Charge le profil existant sans écraser le formulaire
  loadProfile() {
    this.freelancerService.getById(this.currentUserId).subscribe({
      next: (data: FreelancerProfile) => {
        console.log('✅ Profil chargé', data);
        this.existingProfile = data;
        this.freelancer = { ...data }; // Pré-remplir le formulaire
        this.isEditMode = true;
      },
      error: (err: any) => {
        if (err.status === 404) {
          console.log('ℹ️ Aucun profil trouvé, formulaire vide prêt');
          this.isEditMode = false;
        } else {
          console.error('❌ Erreur chargement profil', err);
          this.errorMessage = 'Erreur lors du chargement du profil.';
        }
      }
    });
  }

  // ✅ Sauvegarde : POST si nouveau, PUT si existant
  save() {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isEditMode) {
      // Mise à jour
      this.freelancerService.update(this.currentUserId, this.freelancer).subscribe({
        next: (res: FreelancerProfile) => {
          console.log('✅ Profil mis à jour', res);
          this.existingProfile = res;
          this.successMessage = 'Profil mis à jour avec succès !';
        },
        error: (err: any) => {
          console.error('❌ Erreur mise à jour', err);
          this.errorMessage = 'Erreur lors de la mise à jour.';
        }
      });
    } else {
      // Création
      this.freelancerService.add(this.currentUserId, this.freelancer).subscribe({
        next: (res: FreelancerProfile) => {
          console.log('✅ Profil créé', res);
          this.existingProfile = res;
          this.isEditMode = true; // Passe en mode édition après création
          this.successMessage = 'Profil créé avec succès !';
        },
        error: (err: any) => {
          console.error('❌ Erreur création', err);
          this.errorMessage = 'Erreur lors de la création du profil.';
        }
      });
    }
  }

  // ✅ Réinitialise le formulaire
  resetForm() {
    this.freelancer = this.emptyForm();
    this.isEditMode = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Formulaire vide
  private emptyForm(): FreelancerProfile {
    return {
      firstName: '',
      lastName: '',
      title: '',
      overview: '',
      hourlyRate: 0,
      experienceLevel: '',
      availability: '',
      country: ''
    };
  }
}