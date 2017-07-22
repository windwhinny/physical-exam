import webpack = require('webpack');
import webpackConfig from './webpack.prod';
const builder = require('electron-builder');

function webpackBuild() {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err: Error, state: webpack.Stats) => {
      if (err) return reject(err);

      if (state.hasErrors() || state.hasWarnings()) {
        const info = state.toJson({
          chunks: false,
        });
        if (state.hasErrors()) {
          info.errors.forEach((e: Error) => {
            console.error('ERROR:', e);
          })
        }
        if (state.hasWarnings()) {
          info.warnings.forEach((warn: string) => {
            console.warn('WARN:', warn);
          })
        }
        return reject(new Error('compile faild'));
      }
      resolve();
    })
  })
}

function electronBuild () {
  return builder.build({
    targets: builder.Platform.WINDOWS.createTarget(),
    config: {
      appId: 'physical-exam',
      productName: '体育测试',
      files: [
        'src/**/*.js',
        'src/**/*.mp3',
        'src/index.html',
        '!src/render/**/*.js',
        'dist/app.js',
        'node_modules',
        '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme,test,__tests__,tests,powered-test,example,examples,*.d.ts}',
        '!**/node_modules/.bin',
        '!**/*.{o,hprof,orig,pyc,pyo,rbc}',
        '!**/._*',
        '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,__pycache__,thumbs.db,.gitignore,.gitattributes,.editorconfig,.flowconfig,.yarn-metadata.json,.idea,appveyor.yml,.travis.yml,circle.yml,npm-debug.log,.nyc_output,yarn.lock,.yarn-integrity}'
      ],
      npmArgs: [
        '--production'
      ],
    }
  })
}

webpackBuild().then(() => {
  console.log('Webpack build done!');
  return electronBuild();
})
.then(() => {
  console.log('Electron build done!');
}, err => {
  console.error(err);
  process.exit(1);
});
