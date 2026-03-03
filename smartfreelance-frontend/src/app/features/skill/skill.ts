import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillService } from '../../services/skill';
import { Skill } from '../../models/skill.model';

@Component({
  standalone: true,
  selector: 'app-skill',
  templateUrl: './skill.html',
  styleUrls: ['./skill.css'],
  imports: [CommonModule, FormsModule]
})
export class SkillComponent implements OnInit {
  skill: Skill = {
    name: '',
    level: ''
  };

  skills: Skill[] = [];
  currentUserId: number = 1; // TODO: Récupérer depuis auth/session
  isEditMode: boolean = false;
  selectedSkillId?: number;

  constructor(private skillService: SkillService) { }

  ngOnInit() {
    this.loadSkills();
  }

  save() {
    if (this.isEditMode && this.selectedSkillId) {
      this.skillService.update(this.currentUserId, this.selectedSkillId, this.skill).subscribe({
        next: (res: Skill) => {
          console.log('Skill mis à jour', res);
          this.loadSkills();
          this.resetForm();
        },
        error: (err: any) => console.error('Erreur MAJ skill', err)
      });
    } else {
      this.skillService.add(this.currentUserId, this.skill).subscribe({
        next: (res: Skill) => {
          console.log('Skill ajouté', res);
          this.loadSkills();
          this.resetForm();
        },
        error: (err: any) => console.error('Erreur ajout skill', err)
      });
    }
  }

  editSkill(skill: Skill) {
    this.skill = { ...skill };
    this.selectedSkillId = skill.id;
    this.isEditMode = true;
  }

  deleteSkill(skillId?: number) {
    if (skillId && confirm('Voulez-vous supprimer cette compétence ?')) {
      this.skillService.delete(this.currentUserId, skillId).subscribe({
        next: () => {
          console.log('Skill supprimé');
          this.loadSkills();
        },
        error: (err: any) => console.error('Erreur suppression skill', err)
      });
    }
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
    this.skill = {
      name: '',
      level: ''
    };
    this.isEditMode = false;
    this.selectedSkillId = undefined;
  }
}