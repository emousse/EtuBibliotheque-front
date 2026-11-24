import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentDetailComponent } from './student-detail.component';
import { StudentService } from '../../../core/service/student.service';
import { STUDENT_MOCK } from '../../../core/service/student-mock.service';

/**
 * Tests de la fiche étudiant (plan de tests : F-CMP-08 et 09).
 * ActivatedRoute est simulée pour fournir l'id de l'URL (/students/1).
 */
describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;
  let studentService: { getById: jest.Mock; delete: jest.Mock };
  let router: Router;

  async function setup(getByIdResult = of(STUDENT_MOCK)): Promise<void> {
    studentService = { getById: jest.fn().mockReturnValue(getByIdResult), delete: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  }

  afterEach(() => jest.restoreAllMocks());

  it('should load the student from the route id and display it', async () => {
    await setup();

    expect(studentService.getById).toHaveBeenCalledWith(1);
    expect(component.student).toEqual(STUDENT_MOCK);
    expect(fixture.nativeElement.textContent).toContain('ada@example.com');
    expect(fixture.nativeElement.textContent).toContain('10/12/2000');
  });

  it('should display the server error when the student does not exist', async () => {
    await setup(throwError(() => new HttpErrorResponse({ status: 404, error: { message: 'Student with id 1 not found' } })));
    fixture.detectChanges();

    expect(component.student).toBeNull();
    expect(fixture.nativeElement.querySelector('.alert-danger').textContent).toContain('Student with id 1 not found');
  });

  it('should delete the student and go back to the list when confirmed', async () => {
    await setup();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    studentService.delete.mockReturnValue(of(undefined));

    component.onDelete();

    expect(studentService.delete).toHaveBeenCalledWith(1);
    expect(router.navigate).toHaveBeenCalledWith(['/students']);
  });

  it('should not delete when the confirmation is cancelled', async () => {
    await setup();
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    component.onDelete();

    expect(studentService.delete).not.toHaveBeenCalled();
  });

  it('should display the server error when the deletion fails', async () => {
    await setup();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    studentService.delete.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    component.onDelete();

    expect(component.errorMessage).toContain('Impossible de supprimer');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
