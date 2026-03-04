import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.css'],
})
export class ProjectEditComponent implements OnInit {

  projectForm: FormGroup;
  loading = false;
  projectId!: number;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(500)],
      budget: [0, [Validators.required, Validators.min(0)]],
      deadline: ['', [Validators.required, this.futureDateValidator]]
    });
  }

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadProject();
  }

  loadProject(): void {
    this.projectService.getById(this.projectId).subscribe({
      next: (project: Project) => this.projectForm.patchValue(project),
      error: err => console.error(err)
    });
  }

  submit(): void {
    if (this.projectForm.invalid) return;
    this.loading = true;

    this.projectService.update(this.projectId, this.projectForm.value).subscribe({
      next: (res) => {
        console.log('Project updated:', res);
        this.router.navigate(['/projects']); 
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // VALIDATE FUTURE DATE
  futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const today = new Date();
    const selected = new Date(control.value);
    return selected >= today ? null : { futureDate: true };
  }

}