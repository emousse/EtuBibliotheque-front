module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  // Mesure tout le code de l'application, y compris les fichiers qu'aucun test n'importe
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    // Doublures utilisées uniquement par les tests
    '!src/app/**/*-mock.service.ts',
    // Configuration de démarrage (providers), sans logique propre
    '!src/app/app.config.ts',
  ],
  // html : rapport navigable (coverage/index.html) ; text-summary : résumé dans le terminal
  coverageReporters: ['html', 'text-summary'],
  // Jest échoue si la couverture passe sous 80 %
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
