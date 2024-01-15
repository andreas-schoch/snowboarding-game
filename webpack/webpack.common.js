const path = require('path');
const Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: ['./game/src/index.ts'],
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
        test: /\.ts?$|\.js?$/,
        include: path.join(__dirname, '../game'),
        loader: 'ts-loader',
      },
      {
        test: /\.tsx?$/,
        include: path.join(__dirname, '../game/src/UI'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['solid']
          }
        },
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
    new HtmlWebpackPlugin({ template: 'game/index.html' }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'game/assets/audio', to: 'assets/audio' },
        { from: 'game/assets/img/packed', to: 'assets/img/packed' },
        { from: 'game/assets/img/icons', to: 'assets/img/icons' },
        { from: 'game/assets/img/controls', to: 'assets/img/controls' },
        { from: 'game/assets/img/thumbnails', to: 'assets/img/thumbnails' },
        { from: 'game/assets/html', to: 'assets/html' },
        { from: 'game/assets/levels/export', to: 'assets/levels/export' },
        { from: 'game/assets/manifest', to: '' },
        { from: 'node_modules/box2d-wasm/dist/es/Box2D.wasm', to: '' },
        { from: 'node_modules/box2d-wasm/dist/es/Box2D.simd.wasm', to: '' },
      ],
    }),
  ],
};
