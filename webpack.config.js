const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.ts', // Ponto de entrada do seu código
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/'
  },
  devtool: 'inline-source-map', // Ajuda a debugar o TS no navegador
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
    extensions: ['.ts', '.js'] // Permite importar sem colocar a extensão
  },
  devServer: {
    static: [
      {
        directory: path.join(__dirname),
      },
    ],
  }
};