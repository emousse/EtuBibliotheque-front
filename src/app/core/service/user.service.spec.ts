import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { Register } from '../models/Register';

/**
 * Tests de UserService (plan de tests : F-SVC-01 à 03).
 * HttpTestingController intercepte les appels HTTP : on vérifie l'URL, la méthode et le corps envoyés,
 * puis on simule la réponse du back-end avec flush().
 */
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    // Échoue si une requête attendue n'a pas été traitée, ou si une requête inattendue a été envoyée
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('register should POST the user to /api/register', () => {
    const user: Register = { firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'secret' };

    service.register(user).subscribe();

    const req = httpMock.expectOne('/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);
    req.flush(null, { status: 201, statusText: 'Created' });
  });

  it('login should POST the credentials and store the returned token', () => {
    let response: unknown;

    service.login({ login: 'ada', password: 'secret' }).subscribe(res => response = res);

    const req = httpMock.expectOne('/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ login: 'ada', password: 'secret' });
    req.flush({ token: 'jwt-token' });

    expect(response).toEqual({ token: 'jwt-token' });
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  it('should report the login state from the stored token', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();

    localStorage.setItem('token', 'jwt-token');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getToken()).toBe('jwt-token');

    service.logout();
    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
