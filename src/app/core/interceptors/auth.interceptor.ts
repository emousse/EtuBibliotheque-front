import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserService } from '../service/user.service';

/**
 * Ajoute le header « Authorization: Bearer <token> » à chaque requête vers l'API
 * quand l'utilisateur est connecté.
 * Si l'API répond 401 (token absent, invalide ou expiré), le token est supprimé
 * et l'utilisateur est renvoyé vers la page de login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const token = userService.getToken();

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.endsWith('/api/login')) {
        userService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
