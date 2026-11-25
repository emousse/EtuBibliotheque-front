/**
 * Configuration webpack utilisée uniquement par la cible « build-e2e » (tests Cypress).
 * Elle instrumente le code TypeScript de l'application avec Istanbul : chaque ligne exécutée
 * pendant les tests E2E est comptée dans window.__coverage__, que @cypress/code-coverage collecte.
 * Le build normal (ng serve / ng build) n'est pas concerné.
 */
module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: '@jsdevtools/coverage-istanbul-loader',
        options: { esModules: true },
        enforce: 'post',
        include: require('path').join(__dirname, 'src', 'app'),
        exclude: [/\.spec\.ts$/, /node_modules/, /-mock\.service\.ts$/],
      },
    ],
  },
};
