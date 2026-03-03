import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { FreelancerProfileComponent } from './freelancer-profile';

describe('FreelancerProfileComponent', () => {
  let component: FreelancerProfileComponent;
  let fixture: ComponentFixture<FreelancerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreelancerProfileComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreelancerProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
