import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.css'],
})
export class ProjectCreateComponent {
  loading = false;
  projectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(500)],
      budget: [0, [Validators.required, Validators.min(0)]],
      deadline: ['', [Validators.required, this.futureDateValidator]]
    });
  }

  // Validateur pour date future
  futureDateValidator(control: AbstractControl) {
    
    if (!control.value) return null;
    const today = new Date();
    const selected = new Date(control.value);
    return selected >= today ? null : { futureDate: true };
  }

  submit(): void {
    if (this.projectForm.invalid) return;

    this.loading = true;

    this.projectService.create(this.projectForm.value).subscribe({
      next: (res) => {
        console.log('Project created:', res);
        this.router.navigate(['/projects']); 
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}