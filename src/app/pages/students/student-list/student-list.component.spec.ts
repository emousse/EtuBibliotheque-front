import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../../core/service/student.service';
import { UserService } from '../../../core/service/user.service';
import { STUDENT_MOCK } from '../../../core/service/student-mock.service';

/**
 * Tests de la liste des étudiants (plan de tests : F-CMP-05 à 07).
 */
describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentService: { getAll: jest.Mock; delete: jest.Mock };
  let userService: { logout: jest.Mock };
  let router: Router;

  async function setup(getAllResult = of([STUDENT_MOCK])): Promise<void> {
    studentService = { getAll: jest.fn().mockReturnValue(getAllResult), delete: jest.fn() };
    userService = { logout: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: UserService, useValue: userService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  }

  afterEach(() => jest.restoreAllMocks());

  it('should load and display the students on init', async () => {
    await setup();

    expect(studentService.getAll).toHaveBeenCalled();
    expect(component.students).toEqual([STUDENT_MOCK]);
    expect(fixture.nativeElement.textContent).toContain('Lovelace');
  });

  it('should display an empty state when there is no student', async () => {
    await setup(of([]));

    expect(fixture.nativeElement.textContent).toContain('Aucun étudiant pour le moment.');
  });

  it('should display the server error when loading fails', async () => {
    await setup(throwError(() => new HttpErrorResponse({ status: 500, error: { message: 'Internal Server error' } })));
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Internal Server error');
    expect(fixture.nativeElement.querySelector('.alert-danger')).not.toBeNull();
  });

  it('should delete the student and remove it from the list when confirmed', async () => {
    await setup();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    studentService.delete.mockReturnValue(of(undefined));

    component.onDelete(STUDENT_MOCK);

    expect(studentService.delete).toHaveBeenCalledWith(STUDENT_MOCK.id);
    expect(component.students).toEqual([]);
  });

  it('should not delete anything when the confirmation is cancelled', async () => {
    await setup();
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    component.onDelete(STUDENT_MOCK);

    expect(studentService.delete).not.toHaveBeenCalled();
    expect(component.students).toHaveLength(1);
  });

  it('should display the server error when the deletion fails', async () => {
    await setup();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    studentService.delete.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404, error: { message: 'Student with id 1 not found' } })));

    component.onDelete(STUDENT_MOCK);

    expect(component.errorMessage).toBe('Student with id 1 not found');
    expect(component.students).toHaveLength(1);
  });

  it('should log out and navigate to /login', async () => {
    await setup();

    component.onLogout();

    expect(userService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
