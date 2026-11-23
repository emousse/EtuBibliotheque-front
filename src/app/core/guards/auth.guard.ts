import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../service/user.service';

/**
 * Autorise l'accès à une route seulement si l'utilisateur est connecté ;
 * sinon, redirige vers la page de login.
 */
export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  return userService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
