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
      {
        test: /\.worker\.js$/,
        use: {loader: 'worker-loader'},
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
        {from: 'src/assets', to: 'assets'},
        {from: 'src/favicon.ico', to: ''},
        {from: 'node_modules/box2d-wasm/dist/es/Box2D.wasm', to: 'assets'},
        {from: 'node_modules/box2d-wasm/dist/es/Box2D.simd.wasm', to: 'assets'},
        {from: 'node_modules/box2d-wasm/dist/es/Box2D.wasm', to: ''},
        {from: 'node_modules/box2d-wasm/dist/es/Box2D.simd.wasm', to: ''},
      ],
    }),
  ],
};
