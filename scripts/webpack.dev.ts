import webpack = require('webpack');
import path = require('path');
import config = require('config');
import merge = require('webpack-merge');
import defaultConfig from './webpack.base';
const root = config.get('root') as string;
const publicPath = 'http://localhost:8080/'
export default merge(defaultConfig, {
  output: {
    filename: '[name].js',
    path: path.resolve(root, './src'),
    publicPath,
  },
  entry: {
    app: [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      path.resolve(root, './src/render/index.tsx'),
    ],
  },
  devtool: 'source-map',
  devServer: {
    hot: true,
    contentBase: path.join(root, 'src'),
    publicPath,
    port: 8080,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
});
