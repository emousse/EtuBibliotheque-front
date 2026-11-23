import { Observable, of } from 'rxjs';
import { Student } from '../models/Student';
import { StudentRequest } from '../models/StudentRequest';

export const STUDENT_MOCK: Student = {
  id: 1,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  birthDate: '2000-12-10'
};

export class StudentMockService {

  getAll(): Observable<Student[]> {
    return of([STUDENT_MOCK]);
  }

  getById(id: number): Observable<Student> {
    return of({ ...STUDENT_MOCK, id });
  }

  create(student: StudentRequest): Observable<Student> {
    return of({ ...student, id: 1 });
  }

  update(id: number, student: StudentRequest): Observable<Student> {
    return of({ ...student, id });
  }

  delete(id: number): Observable<void> {
    return of(undefined);
  }
}
