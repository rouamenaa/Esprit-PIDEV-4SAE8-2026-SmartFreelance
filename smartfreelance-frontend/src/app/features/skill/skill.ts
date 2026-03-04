import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, PatternValidator } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatError } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { SkillService } from '../../services/skill';
import { Skill } from '../../models/skill.model';

@Component({
  standalone: true,
  selector: 'app-skill',
  templateUrl: './skill.html',
  styleUrls: ['./skill.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule, MatError]
})
export class SkillComponent implements OnInit {

  // Formulaire réactif
  skillForm!: FormGroup;

  // Compétence sélectionnée pour l'édition
  existingSkill: Skill | null = null;

  skills: Skill[] = [];
  currentUserId: number = 1; // TODO: Récupérer depuis auth/session
  isEditMode: boolean = false;
  selectedSkillId?: number;
  showForm: boolean = false;
  showSkillsList: boolean = true;
  confirmDeleteId?: number;

  constructor(
    private skillService: SkillService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadSkills();
  }

  private initializeForm() {
    this.skillForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      level: ['', [
        Validators.required,
        Validators.pattern(/^(Beginner|Intermediate|Advanced|Expert)$/)
      ]]
    });
  }

  save() {
    if (this.skillForm.invalid) {
      console.error('Formulaire invalide');
      return;
    }

    const formData = this.skillForm.value;

    if (this.isEditMode && this.selectedSkillId) {
      this.skillService.update(this.currentUserId, this.selectedSkillId, formData).subscribe({
        next: (res: Skill) => {
          console.log('✅ Skill mis à jour', res);
          this.loadSkills();
          this.hideForm();
        },
        error: (err: any) => console.error('❌ Erreur MAJ skill', err)
      });
    } else {
      this.skillService.add(this.currentUserId, formData).subscribe({
        next: (res: Skill) => {
          console.log('✅ Skill ajouté', res);
          this.loadSkills();
          this.hideForm();
        },
        error: (err: any) => console.error('❌ Erreur ajout skill', err)
      });
    }
  }

  editSkill(skill: Skill) {
    this.existingSkill = skill;
    this.selectedSkillId = skill.id;
    this.isEditMode = true;
    this.skillForm.patchValue(skill);
    this.showForm = true;
    this.showSkillsList = false;
  }

  showAddForm() {
    this.resetForm();
    this.showForm = true;
    this.showSkillsList = false;
  }

  hideForm() {
    this.showForm = false;
    this.showSkillsList = true;
    this.resetForm();
  }

  confirmDelete(skillId?: number) {
    this.confirmDeleteId = skillId;
  }

  cancelDelete() {
    this.confirmDeleteId = undefined;
  }

  deleteSkill(skillId?: number) {
    if (!skillId) return;
    this.skillService.delete(this.currentUserId, skillId).subscribe({
      next: () => {
        console.log('✅ Skill supprimé');
        this.confirmDeleteId = undefined;
        this.loadSkills();
      },
      error: (err: any) => console.error('❌ Erreur suppression skill', err)
    });
  }

  loadSkills() {
    this.skillService.getAll(this.currentUserId).subscribe({
      next: (data: Skill[]) => {
        this.skills = data;
      },
      error: (err: any) => {
        console.error('Erreur récupération skills', err);
      }
    });
  }

  resetForm() {
    this.skillForm.reset();
    this.existingSkill = null;
    this.isEditMode = false;
    this.selectedSkillId = undefined;
  }

  resetField(fieldName: string) {
    const fieldValue = this.skillForm.get(fieldName)?.value;
    const existingValue = this.existingSkill?.[fieldName as keyof Skill];
    
    // Si la valeur actuelle est différente de la valeur existante, restaurer la valeur existante
    // Sinon, réinitialiser à vide
    if (fieldValue !== existingValue && existingValue !== undefined) {
      this.skillForm.get(fieldName)?.setValue(existingValue);
    } else {
      this.skillForm.get(fieldName)?.setValue('');
    }
    
    // Marquer le champ comme "touched" pour déclencher la validation
    this.skillForm.get(fieldName)?.markAsTouched();
  }

  getSkillLevelClass(level: string): string {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'level-beginner';
      case 'intermediate':
        return 'level-intermediate';
      case 'advanced':
        return 'level-advanced';
      case 'expert':
        return 'level-expert';
      default:
        return 'level-beginner';
    }
  }

  getSkillBadgeClass(level: string): string {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'badge-beginner';
      case 'intermediate':
        return 'badge-intermediate';
      case 'advanced':
        return 'badge-advanced';
      case 'expert':
        return 'badge-expert';
      default:
        return 'badge-beginner';
    }
  }

  // ✅ Navigation vers le profil freelancer
  goBackToProfile() {
    this.router.navigate(['/profil-freelancer']);
  }
}