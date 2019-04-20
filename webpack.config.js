const path = require('path');
const Dotenv = require('dotenv-webpack');
const nodeExternals = require('webpack-node-externals');

const plugins = [];

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  plugins.push(new Dotenv());
}

module.exports = {
  entry: ['./src/index.ts'],
  target: 'node',
  watch: process.env.NODE_ENV === 'development',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.mjs', '.ts', '.js', '.json'],
    alias: {
      features: path.resolve(__dirname, 'src/features'),
      helpers: path.resolve(__dirname, 'src/helpers/functions'),
      '@root': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins,
};
