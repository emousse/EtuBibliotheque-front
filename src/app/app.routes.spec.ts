import { routes } from './app.routes';
import { authGuard } from './core/guards/auth.guard';

/**
 * Vérifie la configuration du routage : redirection par défaut et protection des écrans étudiants.
 */
describe('app routes', () => {
  it('should redirect the empty path to /login', () => {
    const root = routes.find(route => route.path === '');

    expect(root?.redirectTo).toBe('login');
  });

  it('should protect every /students route with authGuard', () => {
    const students = routes.find(route => route.path === 'students');

    expect(students?.canActivate).toContain(authGuard);
    expect(students?.children?.map(child => child.path)).toEqual(['', 'new', ':id', ':id/edit']);
  });

  it('should keep /login and /register public', () => {
    const publicRoutes = routes.filter(route => route.path === 'login' || route.path === 'register');

    expect(publicRoutes).toHaveLength(2);
    publicRoutes.forEach(route => expect(route.canActivate).toBeUndefined());
  });
});
