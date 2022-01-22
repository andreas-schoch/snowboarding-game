const {merge} = require('webpack-merge');
const common = require('./webpack.common');
const path = require('path');

const dev = {
  mode: 'development',
  devtool: 'inline-source-map',
  // experiments: { // TODO WASM serving seems to work without this
  //   asyncWebAssembly: true,
  //   syncWebAssembly: true,
  // },
  devServer: {
    hot: false, // https://tips4devs.com/articles/create-a-liquidfun-box2d-via-web-assembly-waterslide-with-three-js.html
    liveReload: true,
    open: true,
  },
};

module.exports = merge(common, dev);
