const path = require('path');
const CleanPlugin = require('clean-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/app.ts', // Ponto de entrada do seu código
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/'
  },
  devtool: 'none', // Ajuda a debugar o TS no navegador
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
  plugins : [
    new CleanPlugin.CleanWebpackPlugin()
  ],
  devServer: {
    static: [
      {
        directory: path.join(__dirname),
      },
    ],
  }
};