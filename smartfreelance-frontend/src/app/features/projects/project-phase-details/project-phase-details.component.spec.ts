import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ProjectPhaseDetailsComponent } from './project-phase-details.component';

describe('ProjectPhaseDetailsComponent', () => {
  let component: ProjectPhaseDetailsComponent;
  let fixture: ComponentFixture<ProjectPhaseDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [ProjectPhaseDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectPhaseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
