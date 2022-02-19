const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: ['./src/scripts/index.ts'],
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
        loader: 'ts-loader'
      },
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" },
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
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({gameName: 'Wicked Snowman', template: 'src/index.html'}),
    new CopyWebpackPlugin({
      patterns: [
        {from: 'src/assets/fonts', to: 'assets/fonts'},
        {from: 'src/assets/audio', to: 'assets/audio'},
        {from: 'src/assets/img/atlas', to: 'assets/img/atlas'},
        {from: 'src/assets/img/icons', to: 'assets/img/icons'},
        {from: 'src/favicon.ico', to: ''},
        {from: 'src/manifest.json', to: ''},
      ],
    })
  ],
};
