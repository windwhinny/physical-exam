import webpack = require('webpack');
import TSLoader = require('awesome-typescript-loader');
const px2rem = require('postcss-px2rem');
export default {
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json'],
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
              px2rem({remUnit: 75})
            ]
          }
        },
      ],
    }]
  },
  target: 'electron-renderer',
  plugins: [
    new webpack.NamedModulesPlugin(),
    new TSLoader.TsConfigPathsPlugin({
      configFileName: 'src/render/tsconfig.json',
    // tslint:disable-next-line:no-any
    }) as any,
  ],
}
