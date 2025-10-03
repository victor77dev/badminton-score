const { getDefaultConfig } = require('expo/webpack-config');
const path = require('node:path');

module.exports = async function (env, argv) {
  const config = await getDefaultConfig(env, argv);
  const projectRoot = __dirname;

  const resolvePath = (relativePath) => path.resolve(projectRoot, relativePath);

  config.resolve = config.resolve ?? {};
  config.resolve.alias = {
    ...(config.resolve.alias ?? {}),
    '#': resolvePath('src'),
    '#/components': resolvePath('src/components'),
    '#/constants': resolvePath('src/constants'),
    '#/hooks': resolvePath('src/hooks'),
    '#/assets': resolvePath('assets'),
  };

  return config;
};
