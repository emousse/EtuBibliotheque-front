import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { UserService } from '../../core/service/user.service';

/**
 * Tests du composant de connexion (plan de tests : F-CMP-01 à 03).
 * UserService est remplacé par un objet dont la méthode login est un mock Jest :
 * chaque test choisit la réponse simulée (succès ou erreur serveur).
 */
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: { login: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    userService = { login: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  function fillForm(login: string, password: string): void {
    component.loginForm.setValue({ login, password });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show the account-created banner by default', () => {
    expect(component.registered).toBe(false);
    expect(fixture.nativeElement.querySelector('.alert-success')).toBeNull();
  });

  it('should show the account-created banner when coming from registration, until the form is submitted', async () => {
    // GIVEN : l'inscription redirige vers /login?registered=true
    await router.navigateByUrl('/?registered=true');
    const registeredFixture = TestBed.createComponent(LoginComponent);
    registeredFixture.detectChanges();
    const banner = () => registeredFixture.nativeElement.querySelector('.alert-success');

    expect(banner().textContent).toContain('Compte créé');

    // WHEN : l'agent soumet le formulaire de connexion
    registeredFixture.componentInstance.onSubmit();
    registeredFixture.detectChanges();

    // THEN : le bandeau disparaît
    expect(banner()).toBeNull();
  });

  it('should not call the API and should show required errors when the form is empty', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(userService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Login is required');
    expect(fixture.nativeElement.textContent).toContain('Password is required');
  });

  it('should log in and navigate to /students on success', () => {
    userService.login.mockReturnValue(of({ token: 'jwt-token' }));
    fillForm('demo', 'demo1234');

    component.onSubmit();

    expect(userService.login).toHaveBeenCalledWith({ login: 'demo', password: 'demo1234' });
    expect(component.success).toBe(true);
    expect(component.loading).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/students']);
  });

  it('should display the server error message on failure', () => {
    userService.login.mockReturnValue(throwError(() =>
      new HttpErrorResponse({ status: 400, error: { message: 'Invalid credentials' } })));
    fillForm('demo', 'wrong');

    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.loading).toBe(false);
    expect(fixture.nativeElement.querySelector('.alert-danger').textContent).toContain('Invalid credentials');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should display a default message when the server is unreachable', () => {
    userService.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    fillForm('demo', 'demo1234');

    component.onSubmit();

    expect(component.errorMessage).toContain('Erreur lors de la connexion');
  });

  it('should reset the form and the messages on cancel', () => {
    fillForm('demo', 'demo1234');
    component.submitted = true;
    component.errorMessage = 'Invalid credentials';

    component.onReset();

    expect(component.loginForm.value).toEqual({ login: null, password: null });
    expect(component.submitted).toBe(false);
    expect(component.errorMessage).toBeNull();
  });
});
