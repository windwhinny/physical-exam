import webpack = require('webpack');
import path = require('path');
import config = require('config');
import TSLoader = require('awesome-typescript-loader');
const root = config.get('root') as string;
const publicPath = 'http://localhost:8080/'
export default {
  output: {
    filename: '[name].js',
    path: path.resolve(root, './dist'),
    publicPath,
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  entry: {
    app: [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      path.resolve(root, './src/render/index.tsx'),
    ],
  },
  module: {
    rules: [{
      test: /\.(tsx|ts)$/,
      loader: 'awesome-typescript-loader',
      options: {
        configFileName: 'src/render/tsconfig.json'
      }
    }, {
      test: /\.(css|scss)$/,
      use: [
        'style-loader',
        'css-loader?-minimize',
        {
          loader: 'postcss-loader',
          options: {
            plugins: [
              require('precss')({
                parser: require('postcss-scss')
              }),
              require('cssnano')({
                discardComments: {
                  removeAll: true,
                },
                discardUnused: false,
                mergeIdents: false,
                reduceIdents: false,
                safe: true,
              }),
            ]
          }
        },
      ],
    }]
  },
  devtool: 'source-map',
  target: 'electron-renderer',
  devServer: {
    hot: true,
    contentBase: path.join(root, 'dist'),
    publicPath,
    port: 8080,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new TSLoader.TsConfigPathsPlugin({
      configFileName: 'src/render/tsconfig.json',
    })
  ],
}
