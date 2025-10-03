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
            '^#/assets/(.+)': './assets/\\1',
            '^#/(.+)': './src/\\1',
            '#': './src',
          },
        },
      ],
    ],
  };
};
