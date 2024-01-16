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
        }
      },
      {
        test: /\.css$/i,
        include: path.join(__dirname, '../game/src/UI'),
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|wav|mp3)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets',
            },
          },
        ],
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
        { from: 'manifest', to: '' },
        { from: 'node_modules/box2d-wasm/dist/es/Box2D.wasm', to: '' },
        { from: 'node_modules/box2d-wasm/dist/es/Box2D.simd.wasm', to: '' },
        // There is a bit of a mix between making files available via file-loader and copy-webpack-plugin
        // The idea was to use file-loader for anything where we only have one version of something
        // Some of these things below will be fetched from the server in future versions so it wouldn't make sense to hardcode them
        { from: 'game/assets/img/packed', to: 'assets/img/packed' },
        { from: 'game/assets/img/thumbnails', to: 'assets/img/thumbnails' },
        { from: 'game/assets/audio/music', to: 'assets/audio/music' },
        { from: 'game/assets/levels/export', to: 'assets/levels/export' },
      ],
    }),
  ],
};
