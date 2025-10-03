module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          alias: {
            '#/components': './src/components',
            '#/components/*': './src/components/*',
            '#/hooks': './src/hooks',
            '#/hooks/*': './src/hooks/*',
            '#/constants': './src/constants',
            '#/constants/*': './src/constants/*',
            '#/assets': './assets',
            '#/assets/*': './assets/*',
          },
        },
      ],
    ],
  };
};
