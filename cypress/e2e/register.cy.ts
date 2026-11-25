/**
 * Parcours E2E : inscription d'un agent (plan de tests : E2E-01).
 */
describe('Inscription', () => {
  it('affiche les erreurs de validation quand le formulaire est vide', () => {
    cy.visit('/register');

    cy.contains('button', 'Register').click();

    cy.contains('First Name is required').should('be.visible');
    cy.contains('Last Name is required').should('be.visible');
    cy.contains('Login is required').should('be.visible');
  });

  it('inscrit un agent puis redirige vers la page de connexion', () => {
    // GIVEN : l'API d'inscription répond 201
    cy.intercept('POST', '/api/register', { statusCode: 201 }).as('register');
    cy.visit('/register');

    // WHEN
    cy.get('input[formControlName=firstName]').type('Ada');
    cy.get('input[formControlName=lastName]').type('Lovelace');
    cy.get('input[formControlName=login]').type('ada');
    cy.get('input[formControlName=password]').type('secret');
    cy.contains('button', 'Register').click();

    // THEN : le bon corps est envoyé, puis l'agent est redirigé vers /login avec un bandeau de confirmation
    cy.wait('@register').its('request.body').should('deep.equal', {
      firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'secret',
    });
    cy.location('pathname').should('eq', '/login');
    cy.get('.alert-success').should('contain.text', 'Compte créé');
  });

  it('affiche l\'erreur du serveur quand le login existe déjà', () => {
    cy.intercept('POST', '/api/register', {
      statusCode: 400,
      body: { message: 'User with login ada already exists' },
    }).as('register');
    cy.visit('/register');

    cy.get('input[formControlName=firstName]').type('Ada');
    cy.get('input[formControlName=lastName]').type('Lovelace');
    cy.get('input[formControlName=login]').type('ada');
    cy.get('input[formControlName=password]').type('secret');
    cy.contains('button', 'Register').click();

    cy.wait('@register');
    cy.get('.alert-danger').should('contain.text', 'User with login ada already exists');
    cy.location('pathname').should('eq', '/register');
  });
});
