import { STUDENT } from '../support/commands';

/**
 * Parcours E2E : gestion des étudiants (plan de tests : E2E-05 à E2E-08).
 * L'agent est déjà connecté (token dans le localStorage) et l'API est simulée.
 */
describe('Gestion des étudiants', () => {
  describe('Liste', () => {
    it('affiche les étudiants', () => {
      cy.intercept('GET', '/api/students', { body: [STUDENT] }).as('students');

      cy.visitAsLoggedIn('/students');

      cy.wait('@students');
      cy.get('tbody tr').should('have.length', 1);
      cy.get('tbody tr').first().should('contain.text', 'Lovelace').and('contain.text', 'ada@example.com');
    });

    it('affiche un message quand il n\'y a aucun étudiant', () => {
      cy.intercept('GET', '/api/students', { body: [] });

      cy.visitAsLoggedIn('/students');

      cy.contains('Aucun étudiant pour le moment.').should('be.visible');
    });

    it('affiche l\'erreur du serveur quand le chargement échoue', () => {
      cy.intercept('GET', '/api/students', { statusCode: 500, body: { message: 'Internal Server error' } });

      cy.visitAsLoggedIn('/students');

      cy.get('.alert-danger').should('contain.text', 'Internal Server error');
    });
  });

  describe('Ajout', () => {
    it('crée un étudiant puis affiche sa fiche', () => {
      // GIVEN
      cy.intercept('GET', '/api/students', { body: [] });
      cy.intercept('POST', '/api/students', { statusCode: 201, body: STUDENT }).as('create');
      cy.intercept('GET', '/api/students/1', { body: STUDENT });
      cy.visitAsLoggedIn('/students');

      // WHEN : depuis la liste, bouton « Ajouter un étudiant »
      cy.contains('a', 'Ajouter un étudiant').click();
      cy.location('pathname').should('eq', '/students/new');
      cy.get('#firstName').type('Ada');
      cy.get('#lastName').type('Lovelace');
      cy.get('#email').type('ada@example.com');
      cy.get('#birthDate').type('2000-12-10');
      cy.contains('button', 'Enregistrer').click();

      // THEN
      cy.wait('@create').its('request.body').should('deep.equal', {
        firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', birthDate: '2000-12-10',
      });
      cy.location('pathname').should('eq', '/students/1');
      cy.contains('Détail de l\'étudiant').should('be.visible');
    });

    it('bloque l\'envoi d\'un formulaire invalide', () => {
      cy.intercept('POST', '/api/students').as('create');
      cy.visitAsLoggedIn('/students/new');

      cy.get('#email').type('pas-un-email');
      cy.contains('button', 'Enregistrer').click();

      cy.contains('Le prénom est obligatoire').should('be.visible');
      cy.contains('L\'email n\'est pas valide').should('be.visible');
      cy.get('@create.all').should('have.length', 0);
    });

    it('affiche l\'erreur du serveur quand l\'email existe déjà', () => {
      cy.intercept('POST', '/api/students', {
        statusCode: 400,
        body: { message: 'Student with email ada@example.com already exists' },
      });
      cy.visitAsLoggedIn('/students/new');

      cy.get('#firstName').type('Ada');
      cy.get('#lastName').type('Lovelace');
      cy.get('#email').type('ada@example.com');
      cy.get('#birthDate').type('2000-12-10');
      cy.contains('button', 'Enregistrer').click();

      cy.get('.alert-danger').should('contain.text', 'already exists');
      cy.location('pathname').should('eq', '/students/new');
    });
  });

  describe('Consultation', () => {
    it('ouvre la fiche d\'un étudiant depuis la liste', () => {
      cy.intercept('GET', '/api/students', { body: [STUDENT] });
      cy.intercept('GET', '/api/students/1', { body: STUDENT }).as('student');
      cy.visitAsLoggedIn('/students');

      cy.contains('a', 'Voir').click();

      cy.wait('@student');
      cy.location('pathname').should('eq', '/students/1');
      cy.contains('ada@example.com').should('be.visible');
      cy.contains('10/12/2000').should('be.visible');
    });

    it('affiche l\'erreur quand l\'étudiant n\'existe pas', () => {
      cy.intercept('GET', '/api/students/99', { statusCode: 404, body: { message: 'Student with id 99 not found' } });

      cy.visitAsLoggedIn('/students/99');

      cy.get('.alert-danger').should('contain.text', 'Student with id 99 not found');
    });
  });

  describe('Modification', () => {
    it('modifie un étudiant depuis sa fiche', () => {
      const updated = { ...STUDENT, lastName: 'King' };
      cy.intercept('GET', '/api/students/1', { body: STUDENT }).as('student');
      cy.intercept('PUT', '/api/students/1', { body: updated }).as('update');
      cy.visitAsLoggedIn('/students/1');
      cy.wait('@student');

      // WHEN : le formulaire s'ouvre pré-rempli, on change le nom
      cy.contains('a', 'Modifier').click();
      cy.location('pathname').should('eq', '/students/1/edit');
      cy.get('#lastName').should('have.value', 'Lovelace').clear().type('King');
      cy.intercept('GET', '/api/students/1', { body: updated });
      cy.contains('button', 'Enregistrer').click();

      // THEN
      cy.wait('@update').its('request.body.lastName').should('eq', 'King');
      cy.location('pathname').should('eq', '/students/1');
      cy.contains('King').should('be.visible');
    });

    it('affiche l\'erreur quand l\'étudiant à modifier n\'existe pas', () => {
      cy.intercept('GET', '/api/students/99', { statusCode: 404 });

      cy.visitAsLoggedIn('/students/99/edit');

      cy.get('.alert-danger').should('contain.text', 'Impossible de charger');
    });
  });

  describe('Suppression', () => {
    it('supprime un étudiant depuis la liste après confirmation', () => {
      cy.intercept('GET', '/api/students', { body: [STUDENT] });
      cy.intercept('DELETE', '/api/students/1', { statusCode: 204 }).as('delete');
      cy.visitAsLoggedIn('/students');
      cy.on('window:confirm', () => true);

      cy.contains('button', 'Supprimer').click();

      cy.wait('@delete');
      cy.contains('Aucun étudiant pour le moment.').should('be.visible');
    });

    it('ne supprime rien quand la confirmation est annulée', () => {
      cy.intercept('GET', '/api/students', { body: [STUDENT] });
      cy.intercept('DELETE', '/api/students/1').as('delete');
      cy.visitAsLoggedIn('/students');
      cy.on('window:confirm', () => false);

      cy.contains('button', 'Supprimer').click();

      cy.get('tbody tr').should('have.length', 1);
      cy.get('@delete.all').should('have.length', 0);
    });

    it('affiche l\'erreur quand la suppression échoue', () => {
      cy.intercept('GET', '/api/students', { body: [STUDENT] });
      cy.intercept('DELETE', '/api/students/1', { statusCode: 404, body: { message: 'Student with id 1 not found' } });
      cy.visitAsLoggedIn('/students');
      cy.on('window:confirm', () => true);

      cy.contains('button', 'Supprimer').click();

      cy.get('.alert-danger').should('contain.text', 'Student with id 1 not found');
    });

    it('supprime un étudiant depuis sa fiche et revient à la liste', () => {
      cy.intercept('GET', '/api/students/1', { body: STUDENT });
      cy.intercept('DELETE', '/api/students/1', { statusCode: 204 }).as('delete');
      cy.intercept('GET', '/api/students', { body: [] });
      cy.visitAsLoggedIn('/students/1');
      cy.on('window:confirm', () => true);

      cy.contains('button', 'Supprimer').click();

      cy.wait('@delete');
      cy.location('pathname').should('eq', '/students');
    });

    it('affiche l\'erreur quand la suppression depuis la fiche échoue', () => {
      cy.intercept('GET', '/api/students/1', { body: STUDENT });
      cy.intercept('DELETE', '/api/students/1', { statusCode: 500 });
      cy.visitAsLoggedIn('/students/1');
      cy.on('window:confirm', () => true);

      cy.contains('button', 'Supprimer').click();

      cy.get('.alert-danger').should('contain.text', 'Impossible de supprimer');
      cy.location('pathname').should('eq', '/students/1');
    });
  });
});
