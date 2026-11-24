import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Serveur Angular instrumenté lancé par « ng e2e » (cible serve-e2e)
    baseUrl: 'http://localhost:4210',
    // Les appels à l'API sont simulés avec cy.intercept() : le back-end n'a pas besoin de tourner
    video: false,
    setupNodeEvents(on, config) {
      // Collecte la couverture de chaque test et génère le rapport à la fin (voir .nycrc.json)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
});
