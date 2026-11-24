import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentFormComponent } from './student-form.component';
import { StudentService } from '../../../core/service/student.service';
import { STUDENT_MOCK } from '../../../core/service/student-mock.service';

/**
 * Tests du formulaire étudiant, partagé entre création et modification (plan de tests : F-CMP-10 à 12).
 * Le mode dépend de la présence d'un id dans la route : setup({}) = création, setup({ id: '1' }) = édition.
 */
describe('StudentFormComponent', () => {
  const formValue = {
    firstName: 'Grace', lastName: 'Hopper', email: 'grace@example.com', birthDate: '1999-12-09'
  };
  let studentService: { getById: jest.Mock; create: jest.Mock; update: jest.Mock };
  let router: Router;

  function setup(params: Record<string, string>) {
    studentService = {
      getById: jest.fn().mockReturnValue(of(STUDENT_MOCK)),
      create: jest.fn().mockReturnValue(of({ ...formValue, id: 2 })),
      update: jest.fn().mockReturnValue(of({ ...formValue, id: 1 })),
    };
    TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(params) } } },
      ]
    });
    const fixture = TestBed.createComponent(StudentFormComponent);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  describe('creation mode', () => {
    it('should start with an empty, invalid form', () => {
      const { component } = setup({});

      expect(component.isEditMode).toBe(false);
      expect(component.studentForm.invalid).toBe(true);
      expect(studentService.getById).not.toHaveBeenCalled();
    });

    it('should create the student and navigate to its detail page', () => {
      const { component } = setup({});
      component.studentForm.setValue(formValue);

      component.onSubmit();

      expect(studentService.create).toHaveBeenCalledWith(formValue);
      expect(studentService.update).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/students', 2]);
    });

    it('should not call the API when the email is invalid', () => {
      const { component, fixture } = setup({});
      component.studentForm.setValue({ ...formValue, email: 'not-an-email' });

      component.onSubmit();
      fixture.detectChanges();

      expect(studentService.create).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain("L'email n'est pas valide");
    });

    it('should display the server error (e.g. duplicate email)', () => {
      const { component, fixture } = setup({});
      studentService.create.mockReturnValue(throwError(() => new HttpErrorResponse({
        status: 400, error: { message: 'Student with email grace@example.com already exists' }
      })));
      component.studentForm.setValue(formValue);

      component.onSubmit();
      fixture.detectChanges();

      expect(component.errorMessage).toContain('already exists');
      expect(component.loading).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('edition mode', () => {
    it('should load the student and fill the form', () => {
      const { component } = setup({ id: '1' });

      expect(component.isEditMode).toBe(true);
      expect(studentService.getById).toHaveBeenCalledWith(1);
      expect(component.studentForm.value.lastName).toBe('Lovelace');
    });

    it('should update the student and navigate to its detail page', () => {
      const { component } = setup({ id: '1' });
      component.studentForm.setValue(formValue);

      component.onSubmit();

      expect(studentService.update).toHaveBeenCalledWith(1, formValue);
      expect(studentService.create).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/students', 1]);
    });

    it('should display an error when the student cannot be loaded', () => {
      TestBed.configureTestingModule({
        imports: [StudentFormComponent],
        providers: [
          provideRouter([]),
          {
            provide: StudentService,
            useValue: { getById: jest.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 }))) }
          },
          { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '99' }) } } },
        ]
      });
      const fixture = TestBed.createComponent(StudentFormComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.errorMessage).toContain('Impossible de charger');
    });
  });
});
