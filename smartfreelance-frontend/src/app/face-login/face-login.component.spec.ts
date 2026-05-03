import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceLoginComponent } from './face-login.component';

describe('FaceLoginComponent', () => {
  let component: FaceLoginComponent;
  let fixture: ComponentFixture<FaceLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
