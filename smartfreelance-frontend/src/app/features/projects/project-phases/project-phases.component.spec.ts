import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ProjectPhasesComponent } from './project-phases.component';

describe('ProjectPhasesComponent', () => {
  let component: ProjectPhasesComponent;
  let fixture: ComponentFixture<ProjectPhasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [ProjectPhasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectPhasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
