import { STUDENT } from '../support/commands';

/**
 * Parcours E2E : protection des écrans (plan de tests : E2E-04 et E2E-09).
 */
describe('Sécurité des écrans', () => {
  it('redirige vers /login quand on ouvre /students sans être connecté', () => {
    cy.visit('/students');

    cy.location('pathname').should('eq', '/login');
  });

  it('redirige vers /login quand le token est refusé par l\'API (401)', () => {
    cy.intercept('GET', '/api/students', { statusCode: 401 }).as('students');

    cy.visitAsLoggedIn('/students');

    cy.wait('@students');
    cy.location('pathname').should('eq', '/login');
    cy.window().its('localStorage.token').should('be.undefined');
  });

  it('déconnecte l\'agent, qui ne peut plus revenir sur la liste', () => {
    cy.intercept('GET', '/api/students', { body: [STUDENT] });
    cy.visitAsLoggedIn('/students');

    cy.contains('button', 'Déconnexion').click();

    cy.location('pathname').should('eq', '/login');
    cy.window().its('localStorage.token').should('be.undefined');
    cy.visit('/students');
    cy.location('pathname').should('eq', '/login');
  });
});
