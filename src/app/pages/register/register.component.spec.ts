import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { UserService } from '../../core/service/user.service';

/**
 * Tests du composant d'inscription (plan de tests : F-CMP-04).
 * Note : le test fourni déclarait { provide: UserService, useValue: UserMockService } ; useValue
 * attend une instance, pas une classe, donc le service n'était pas réellement simulé.
 * Il est remplacé ici par un objet avec un mock Jest.
 */
describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userService: { register: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    userService = { register: jest.fn().mockReturnValue(of({})) };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call the API when the form is invalid', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(userService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('First Name is required');
  });

  const agent = { firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'secret' };

  it('should register the agent and navigate to /login with the registered flag', () => {
    component.registerForm.setValue(agent);

    component.onSubmit();

    expect(userService.register).toHaveBeenCalledWith(agent);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { registered: true } });
  });

  it('should display the server error message and stay on the page when registration fails', () => {
    userService.register.mockReturnValue(throwError(() =>
      new HttpErrorResponse({ status: 400, error: { message: 'User with login ada already exists' } })));
    component.registerForm.setValue(agent);

    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.alert-danger').textContent).toContain('User with login ada already exists');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should display a default message when the server is unreachable', () => {
    userService.register.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.registerForm.setValue(agent);

    component.onSubmit();

    expect(component.errorMessage).toContain('Erreur lors de l\'inscription');
  });

  it('should reset the form and the error message on cancel', () => {
    component.registerForm.patchValue({ firstName: 'Ada' });
    component.submitted = true;
    component.errorMessage = 'User with login ada already exists';

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.errorMessage).toBeNull();
    expect(component.registerForm.value.firstName).toBeNull();
  });
});
