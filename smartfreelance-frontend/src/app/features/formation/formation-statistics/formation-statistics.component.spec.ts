import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { FormationStatisticsComponent } from './formation-statistics.component';

describe('FormationStatisticsComponent', () => {
  let component: FormationStatisticsComponent;
  let fixture: ComponentFixture<FormationStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [FormationStatisticsComponent]
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
