import webpack = require('webpack');
import path = require('path');
import config = require('config');
import merge = require('webpack-merge');
const BabiliPlugin = require('babili-webpack-plugin');
import defaultConfig from './webpack.base';
const root = config.get('root') as string;
const publicPath = '/';
export default merge(defaultConfig, {
  output: {
    filename: '[name].js',
    path: path.resolve(root, './src'),
    publicPath,
  },
  entry: {
    app: [
      path.resolve(root, './src/render/index.tsx'),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new BabiliPlugin({}, {}),
  ],
});
