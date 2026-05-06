import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationStatisticsComponent } from './formation-statistics.component';

describe('FormationStatisticsComponent', () => {
  let component: FormationStatisticsComponent;
  let fixture: ComponentFixture<FormationStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormationStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
