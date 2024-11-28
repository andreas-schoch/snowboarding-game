/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|wav|mp3|bin)$/,
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
    // new BundleAnalyzerPlugin(),
    new Dotenv(),
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({template: 'game/index.html'}),
    new webpack.ProvidePlugin({
      Phaser: path.resolve(__dirname, './phaser-butcher-build/phaser.butchered.min.js')
    }),
    new CopyWebpackPlugin({
      patterns: [
        {from: 'manifest', to: ''},
        {from: 'node_modules/box2d-wasm/dist/es/Box2D.wasm', to: ''},
        {from: 'node_modules/box2d-wasm/dist/es/Box2D.simd.wasm', to: ''},
        // There is a bit of a mix between making files available via file-loader and copy-webpack-plugin
        // The idea was to use file-loader for anything where we only have one version of something
        // Some of these things below will be fetched from the server in future versions so it wouldn't make sense to hardcode them
        {from: 'game/assets/img/packed', to: 'assets/img/packed'},
        {from: 'game/assets/img/thumbnails', to: 'assets/img/thumbnails'},
        {from: 'game/assets/img/logo.png', to: 'assets/img/logo.png'},
        {from: 'game/assets/audio/music', to: 'assets/audio/music'},
        {from: 'game/assets/audio/sfx', to: 'assets/audio/sfx'},
        {from: 'game/assets/levels', to: 'assets/levels'},
        {from: 'game/assets/protobuf', to: 'assets/protobuf'},
      ],
    }),
  ],
};
