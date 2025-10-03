// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      '.expo/**',
      '.expo-shared/**',
      'web-build/**',
    ],
  },
]);
