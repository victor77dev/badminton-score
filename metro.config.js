const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

const resolvePath = (relativePath) => path.resolve(projectRoot, relativePath);

config.resolver.alias = {
  ...(config.resolver.alias ?? {}),
  '#': resolvePath('src'),
  '#/components': resolvePath('src/components'),
  '#/constants': resolvePath('src/constants'),
  '#/hooks': resolvePath('src/hooks'),
  '#/assets': resolvePath('src/assets'),
};

module.exports = config;
