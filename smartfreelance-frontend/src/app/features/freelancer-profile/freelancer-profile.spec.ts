import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { FreelancerProfileComponent } from './freelancer-profile';

describe('FreelancerProfileComponent', () => {
  let component: FreelancerProfileComponent;
  let fixture: ComponentFixture<FreelancerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreelancerProfileComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['userId', '1']]))
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreelancerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
