/**
 * Parcours E2E : connexion (plan de tests : E2E-02 et E2E-03).
 */
describe('Connexion', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('redirige la page d\'accueil vers /login', () => {
    cy.location('pathname').should('eq', '/login');
    cy.contains('h5', 'Login').should('be.visible');
  });

  it('affiche les erreurs de validation quand le formulaire est vide', () => {
    cy.contains('button', 'Login').click();

    cy.contains('Login is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('connecte l\'agent, stocke le token et ouvre la liste des étudiants', () => {
    // GIVEN : l'API renvoie un token, puis une liste vide d'étudiants
    cy.intercept('POST', '/api/login', { body: { token: 'fake-jwt-token' } }).as('login');
    cy.intercept('GET', '/api/students', { body: [] }).as('students');

    // WHEN
    cy.get('#login').type('demo');
    cy.get('#password').type('demo1234');
    cy.contains('button', 'Login').click();

    // THEN
    cy.wait('@login').its('request.body').should('deep.equal', { login: 'demo', password: 'demo1234' });
    cy.location('pathname').should('eq', '/students');
    cy.window().its('localStorage.token').should('eq', 'fake-jwt-token');
    // L'interceptor ajoute le token à l'appel suivant
    cy.wait('@students').its('request.headers.authorization').should('eq', 'Bearer fake-jwt-token');
  });

  it('affiche le message du serveur quand les identifiants sont invalides', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 400,
      body: { message: 'Invalid credentials' },
    }).as('login');

    cy.get('#login').type('demo');
    cy.get('#password').type('wrong');
    cy.contains('button', 'Login').click();

    cy.wait('@login');
    cy.get('.alert-danger').should('contain.text', 'Invalid credentials');
    cy.location('pathname').should('eq', '/login');
  });

  it('mène à la page d\'inscription', () => {
    cy.contains('a', 'Créer un compte').click();

    cy.location('pathname').should('eq', '/register');
  });
});
