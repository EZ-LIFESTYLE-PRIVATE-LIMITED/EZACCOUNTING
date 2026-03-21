const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'RegistrationPage': './src/pages/RegistrationPage.ts',
    'LoginPage': './src/pages/LoginPage.ts',
    'ProfilePage': './src/pages/ProfilePage.ts',
    'HomePage': './src/pages/HomePage.ts',
    'InvoicePage': './src/pages/InvoicePage.ts',
    'ItemsPage': './src/pages/ItemsPage.ts',
    'VendorsPage': './src/pages/VendorsPage.ts',
    'PurchasesPage': './src/pages/PurchasesPage.ts',
    'InvoiceService': './src/services/InvoiceService.ts'
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
