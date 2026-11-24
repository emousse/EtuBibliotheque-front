import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { StudentService } from './student.service';
import { Student } from '../models/Student';
import { StudentRequest } from '../models/StudentRequest';

/**
 * Tests de StudentService (plan de tests : F-SVC-04 à 06) :
 * chaque méthode appelle la bonne route de l'API avec la bonne méthode HTTP et le bon corps.
 */
describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  const request: StudentRequest = {
    firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', birthDate: '2000-12-10'
  };
  const student: Student = { id: 1, ...request };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll should GET /api/students', () => {
    let result: Student[] = [];

    service.getAll().subscribe(students => result = students);

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('GET');
    req.flush([student]);
    expect(result).toEqual([student]);
  });

  it('getById should GET /api/students/:id', () => {
    let result: Student | undefined;

    service.getById(1).subscribe(s => result = s);

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('GET');
    req.flush(student);
    expect(result).toEqual(student);
  });

  it('create should POST the student to /api/students', () => {
    service.create(request).subscribe();

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(student, { status: 201, statusText: 'Created' });
  });

  it('update should PUT the student to /api/students/:id', () => {
    service.update(1, request).subscribe();

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(student);
  });

  it('delete should DELETE /api/students/:id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
