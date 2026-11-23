import { HttpErrorResponse } from '@angular/common/http';

/** Extrait le message d'erreur renvoyé par l'API (ErrorDetails.message) ou un message par défaut. */
export function getErrorMessage(error: HttpErrorResponse, fallback: string): string {
  return error.error?.message ?? fallback;
}
