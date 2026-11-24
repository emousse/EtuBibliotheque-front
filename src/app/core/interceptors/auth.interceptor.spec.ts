import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';

/**
 * Tests d'intégration de authInterceptor (plan de tests : F-SEC-03 à 05).
 * L'interceptor est branché sur un vrai HttpClient ; HttpTestingController capture la requête
 * réellement envoyée (avec ses headers) et permet de simuler une réponse 401.
 */
describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add the Bearer token when the user is logged in', () => {
    localStorage.setItem('token', 'jwt-token');

    http.get('/api/students').subscribe();

    const req = httpMock.expectOne('/api/students');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    req.flush([]);
  });

  it('should not add an Authorization header without token', () => {
    http.get('/api/students').subscribe();

    const req = httpMock.expectOne('/api/students');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('should clear the token and redirect to /login on a 401 response', () => {
    // GIVEN : un token expiré ou falsifié est encore stocké
    localStorage.setItem('token', 'expired-token');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    let receivedStatus = 0;

    // WHEN : le back-end répond 401
    http.get('/api/students').subscribe({ error: error => receivedStatus = error.status });
    httpMock.expectOne('/api/students').flush(null, { status: 401, statusText: 'Unauthorized' });

    // THEN : déconnexion, redirection, et l'erreur reste transmise à l'appelant
    expect(localStorage.getItem('token')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(receivedStatus).toBe(401);
  });

  it('should not redirect when the login request itself fails', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    http.post('/api/login', {}).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/login').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should let other errors through without logging out', () => {
    localStorage.setItem('token', 'jwt-token');
    const navigateSpy = jest.spyOn(router, 'navigate');

    http.get('/api/students/99').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/students/99').flush(null, { status: 404, statusText: 'Not Found' });

    expect(localStorage.getItem('token')).toBe('jwt-token');
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
