import * as webpack from 'webpack';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Read every package.json to get the 'main' field (which is the entry file)
 * Returns an object with { packageName: mainFile }
 */
function getEntries(directory) {
  const packages = fs.readdirSync(path.join(directory, 'node_modules'))
                        .filter(x => x !== '.yarn-integrity');

  return packages.map(packageName => {
    const filePath = path.join(directory, 'node_modules', packageName, 'package.json');
    if (fs.existsSync(filePath)) {
      const contents = fs.readFileSync(filePath).toString();
      return {
        package: packageName,
        main: contents.match(/"jsnext:main": "(.*)"/) || contents.match(/"main": "(.*)"/)
      };
    }
  }).filter(x => x)
    .filter(x => x.main)
    .map(x => ({ package: x.package, main: x.main[1] }))
    .filter(x => x.main)
    .map(x => ({ package: x.package, main: `${x.package}/${x.main.replace('./', '')}` }))
    .reduce((prev, next) => {
      prev[next.package] = next.main;
      return prev;
    }, {})
}

function rewriteManifest(hash, directory) {
  // Rewrite the paths from the manifest from absolute to relative
  const manifestPath = path.join(directory, 'manifest.json');
  const manifestFile = fs.readFileSync(manifestPath).toString();
  const manifestJSON = JSON.parse(manifestFile);
  const regex = new RegExp(`.*?${hash}\/node_modules\/`);

  const newContent = Object.keys(manifestJSON.content).reduce(
  (newContent, next) => {
    newContent[next.replace(regex, '')] = manifestJSON.content[next];
    return newContent;
  }, {});

  // Add entry files to manifest
  const entries = getEntries(directory);

  Object.keys(entries).forEach(packageName => {
    newContent[packageName] = newContent[entries[packageName]];
  });

  // Also transform /index.js in manifest as well
  Object.keys(newContent).forEach(packageRoute => {
    if (packageRoute.endsWith('/index.js')) {
      newContent[packageRoute.replace('/index.js', '')] = newContent[packageRoute];
    }
  })

  fs.writeFileSync(manifestPath, JSON.stringify({
    ...manifestJSON,
    content: newContent,
  }));
}

export default function bundle(hash: string, dependencies: Array<string>, directory: string) {
  const webpackConfig = {
    context: directory,
    entry: {
      vendors: dependencies,
    },
    output: {
      path: directory,
      filename: `${hash}.js`,
      library: 'dependencies',
      libraryTarget: 'umd',
    },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production'),
        }
      }),
      new webpack.DllPlugin({
        path: path.join(directory, 'manifest.json'),
        name: 'dependencies',
        context: '/'
      }),
      new webpack.optimize.UglifyJsPlugin({mangle: false})
    ]
  }

  const compiler = webpack(webpackConfig);

  return new Promise((resolve, reject) => {
    compiler.run((err) => {
      if (err) return reject(err);

      try {
        rewriteManifest(hash, directory);
      } catch (e) {
        return reject(e);
      }

      resolve();
    });
  });
}
