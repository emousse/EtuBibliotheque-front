import { HttpErrorResponse } from '@angular/common/http';
import { getErrorMessage } from './error-message';

/** Tests de getErrorMessage (plan de tests : F-UTL-01). */
describe('getErrorMessage', () => {
  it('should return the message sent by the server (ErrorDetails)', () => {
    const error = new HttpErrorResponse({ status: 400, error: { message: 'Invalid credentials' } });

    expect(getErrorMessage(error, 'Erreur')).toBe('Invalid credentials');
  });

  it('should return the fallback message when the server sent no message', () => {
    const error = new HttpErrorResponse({ status: 0, error: null });

    expect(getErrorMessage(error, 'Erreur par défaut')).toBe('Erreur par défaut');
  });
});
