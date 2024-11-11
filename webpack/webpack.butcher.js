/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = [
  {
    experiments: {outputModule: true},

    name: 'phaser-esm',
    mode: 'production',

    entry: {
      'phaser.butchered.min': path.resolve(__dirname, './phaser.butchered.js')
    },

    output: {
      path: `${__dirname}/phaser-butcher-build/`,
      filename: '[name].js',
      library: {type: 'module'},
      module: true,
      environment: {
        module: true
      }
    },

    performance: {hints: false},

    optimization: {
      minimizer: [
        new TerserPlugin({
          include: /\.min\.js$/,
          parallel: true,
          extractComments: false,
          terserOptions: {
            format: {
              comments: false,
              braces: false,
              quote_keys: false,
            },
            compress: true,
            ie8: false,
            ecma: 2020,
            warnings: false
          }
        })
      ]
    },

    plugins: [
      new webpack.DefinePlugin({
        'typeof CANVAS_RENDERER': JSON.stringify(true),
        'typeof WEBGL_RENDERER': JSON.stringify(true),
        'typeof WEBGL_DEBUG': JSON.stringify(false),
        'typeof EXPERIMENTAL': JSON.stringify(false),
        'typeof PLUGIN_3D': JSON.stringify(false),
        'typeof PLUGIN_CAMERA3D': JSON.stringify(false),
        'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
        'typeof FEATURE_SOUND': JSON.stringify(true)
      }),
    ]
  }
];
