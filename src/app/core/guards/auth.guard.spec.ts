import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { UserService } from '../service/user.service';

describe('authGuard', () => {
  const runGuard = () => TestBed.runInInjectionContext(
    () => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])]
    });
    localStorage.clear();
  });

  it('should allow access when the user is logged in', () => {
    jest.spyOn(TestBed.inject(UserService), 'isLoggedIn').mockReturnValue(true);
    expect(runGuard()).toBe(true);
  });

  it('should redirect to /login when the user is not logged in', () => {
    jest.spyOn(TestBed.inject(UserService), 'isLoggedIn').mockReturnValue(false);
    const result = runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });
});
