import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPhasesComponent } from './project-phases.component';

describe('ProjectPhasesComponent', () => {
  let component: ProjectPhasesComponent;
  let fixture: ComponentFixture<ProjectPhasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectPhasesComponent]
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
