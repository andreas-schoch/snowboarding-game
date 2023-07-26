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
    new HtmlWebpackPlugin({gameName: 'Snowboarding Game', template: 'src/index.html'}),
    new CopyWebpackPlugin({
      patterns: [
        {from: 'src/assets/audio', to: 'assets/audio'},
        {from: 'src/assets/img', to: 'assets/img'},
        {from: 'src/assets/html', to: 'assets/html'},
        {from: 'src/assets/levels/export', to: 'assets/levels/export'},
        {from: 'src/favicon.ico', to: ''},
        {from: 'src/manifest.json', to: ''},
      ],
    }),
  ],
};
