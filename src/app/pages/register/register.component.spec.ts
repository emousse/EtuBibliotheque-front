import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

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
    // jsdom n'implémente pas alert()
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
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

  it('should register the agent and navigate to /login', () => {
    const agent = { firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'secret' };
    component.registerForm.setValue(agent);

    component.onSubmit();

    expect(userService.register).toHaveBeenCalledWith(agent);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should reset the form on cancel', () => {
    component.registerForm.patchValue({ firstName: 'Ada' });
    component.submitted = true;

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.registerForm.value.firstName).toBeNull();
  });
});
