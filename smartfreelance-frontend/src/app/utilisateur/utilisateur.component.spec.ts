import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { UtilisateurComponent } from './utilisateur.component';

describe('UtilisateurComponent', () => {
  let component: UtilisateurComponent;
  let fixture: ComponentFixture<UtilisateurComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    localStorage.setItem('token', 'test-token');
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [UtilisateurComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UtilisateurComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    const initReq = httpMock.expectOne('http://localhost:8085/auth/all');
    expect(initReq.request.method).toBe('GET');
    initReq.flush([]);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate email scenarios', () => {
    component.user.email = '';
    expect(component.validateEmail()).toBeFalse();
    expect(component.emailError).toContain('required');

    component.user.email = 'bad@';
    expect(component.validateEmail()).toBeFalse();
    expect(component.emailError).toContain('Invalid');

    component.user.email = 'valid@test.com';
    expect(component.validateEmail()).toBeTrue();
    expect(component.emailError).toBe('');
  });

  it('addUser should block create mode if document is not verified', () => {
    spyOn(window, 'alert');
    component.isEditMode = false;
    component.verificationResult = null;

    component.addUser();

    expect(window.alert).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  });

  it('addUser should register and set registrationDone on success', () => {
    component.isEditMode = false;
    component.verificationResult = { valid: true, message: 'ok' };
    component.user = {
      id: null,
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'secret1',
      role: 'FREELANCER'
    };

    component.addUser();

    const req = httpMock.expectOne('http://localhost:8085/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.username).toBe('John Doe');
    req.flush({});

    expect(component.registrationDone).toBeTrue();
    expect(component.registeredEmail).toBe('john@doe.com');
    expect(component.isLoading).toBeFalse();
  });

  it('addUser should update user in edit mode', () => {
    spyOn(component, 'loadUsers');
    component.isEditMode = true;
    component.user = {
      id: 12,
      name: 'Jane Doe',
      email: 'jane@doe.com',
      password: 'secret1',
      role: 'CLIENT'
    };

    component.addUser();

    const req = httpMock.expectOne('http://localhost:8085/auth/user/12');
    expect(req.request.method).toBe('PUT');
    req.flush('ok');

    expect(component.loadUsers).toHaveBeenCalled();
    expect(component.isEditMode).toBeFalse();
  });

  it('deleteUser should call backend when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'loadUsers');

    component.deleteUser(99);

    const req = httpMock.expectOne('http://localhost:8085/auth/user/99');
    expect(req.request.method).toBe('DELETE');
    req.flush('deleted');
    expect(component.loadUsers).toHaveBeenCalled();
  });

  it('onFileSelected should accept pdf and reject other formats', () => {
    spyOn(window, 'alert');
    const pdfFile = new File(['x'], 'cv.pdf', { type: 'application/pdf' });
    const txtFile = new File(['x'], 'note.txt', { type: 'text/plain' });

    component.onFileSelected({ target: { files: [pdfFile] } });
    expect(component.selectedFileName).toBe('cv.pdf');

    component.onFileSelected({ target: { files: [txtFile] } });
    expect(window.alert).toHaveBeenCalled();
  });

  it('resetForm should clear form and verification state', () => {
    component.user = { id: 1, email: 'a@a.com', name: 'A', password: '123456', role: 'ADMIN' };
    component.verificationResult = { valid: true, message: 'ok' };
    component.selectedFileName = 'cv.pdf';
    component.registrationDone = true;
    component.registeredEmail = 'a@a.com';

    component.resetForm();

    expect(component.user.email).toBe('');
    expect(component.verificationResult).toBeNull();
    expect(component.selectedFileName).toBe('');
    expect(component.registrationDone).toBeFalse();
    expect(component.registeredEmail).toBe('');
  });
});
