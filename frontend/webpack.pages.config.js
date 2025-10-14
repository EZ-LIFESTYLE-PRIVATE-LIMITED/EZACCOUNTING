const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'RegistrationPage': './src/pages/RegistrationPage.ts',
    'HomePage': './src/pages/HomePage.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist/pages-bundled'),
    filename: '[name].js',
    library: {
      type: 'module'
    },
    module: true
  },
  experiments: {
    outputModule: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'web'
};
