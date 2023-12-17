const path = require('path');
const Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: ['./src/src/index.ts'],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      fs: false,
      path: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$|\.jsx?$/,
        include: path.join(__dirname, '../src'),
        loader: 'ts-loader',
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          filename: '[name].bundle.js',
        },
      },
    },
  },
  plugins: [
    new Dotenv(),
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({ gameName: 'Snowboarding Game', template: 'src/index.html' }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets/audio', to: 'assets/audio' },
        { from: 'src/assets/img/packed', to: 'assets/img/packed' },
        { from: 'src/assets/img/icons', to: 'assets/img/icons' },
        { from: 'src/assets/img/controls', to: 'assets/img/controls' },
        { from: 'src/assets/img/thumbnails', to: 'assets/img/thumbnails' },
        { from: 'src/assets/html', to: 'assets/html' },
        { from: 'src/assets/levels/export', to: 'assets/levels/export' },
        { from: 'src/favicon.ico', to: '' },
        { from: 'src/manifest.json', to: '' },

        { from: 'node_modules/box2d-wasm/dist/es/Box2D.wasm', to: 'assets' },
        { from: 'node_modules/box2d-wasm/dist/es/Box2D.simd.wasm', to: 'assets' },
        { from: 'node_modules/box2d-wasm/dist/es/Box2D.wasm', to: '' },
        { from: 'node_modules/box2d-wasm/dist/es/Box2D.simd.wasm', to: '' },
      ],
    }),
  ],
};
