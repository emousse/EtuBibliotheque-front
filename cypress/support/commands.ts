/**
 * Commandes Cypress réutilisables.
 * Les appels à l'API sont simulés (cy.intercept) : les tests E2E vérifient le comportement des écrans
 * sans dépendre du back-end ni de la base de données.
 */

export const STUDENT = {
  id: 1,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  birthDate: '2000-12-10',
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Simule un utilisateur déjà connecté : un token est placé dans le localStorage avant le chargement. */
      visitAsLoggedIn(url: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('visitAsLoggedIn', (url: string) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      win.localStorage.setItem('token', 'fake-jwt-token');
    },
  });
});
