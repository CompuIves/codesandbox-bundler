import * as webpack from 'webpack';
import * as fs from 'fs';
import * as path from 'path';

const MAIN_ENTRIES = ['jsnext:main', 'module', 'browser', 'main'];

/**
 * Read every package.json to get the 'main' field (which is the entry file)
 * Returns an object with { packageName: mainFile }
 */
function getEntries(directory, dependencies) {
  const packages = [
    ...fs.readdirSync(path.join(directory, 'node_modules')).filter(x => x !== '.yarn-integrity'),
    ...dependencies
  ];

  return packages.map(packageName => {
    const filePath = path.join(directory, 'node_modules', packageName, 'package.json');
    if (fs.existsSync(filePath)) {
      const contents = fs.readFileSync(filePath).toString();

      // Find main entry file
      const main = MAIN_ENTRIES.map(entry => contents.match(new RegExp(`"${entry}":\\s?"(.*)"`)))
        .filter(x => x)[0];
      return {
        package: packageName,
        main,
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

/**
 * This is used to include all js and css files in the dependency folders, this way we can import things
 * like react-dom/server.
 */
function getVendorEntries(basePath: string, dependencies: Array<string>) {
  return dependencies.reduce((prev, dependency) => {
    const depPath = path.join(basePath, 'node_modules', dependency);

    const files = fs.readdirSync(depPath).filter((file) => {
      return (path.extname(file) === '.js' || path.extname(file) === '.css') && file !== path.basename(basePath);
    }).map(file => path.join(dependency, file));

    return [...prev, ...files];
  }, []);
}

function rewriteManifest(hash, directory, dependencies) {
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
  const entries = getEntries(directory, dependencies);

  Object.keys(entries).forEach(packageName => {
    newContent[packageName] = newContent[entries[packageName]];
  });

  // Also transform /index.js in manifest as well
  Object.keys(newContent).forEach(packageRoute => {
    if (packageRoute.endsWith('/index.js')) {
      newContent[packageRoute.replace('/index.js', '')] = newContent[packageRoute];
    }
  })

  fs.writeFileSync(manifestPath, JSON.stringify(newContent));
}

export default function bundle(hash: string, dependencies: Array<string>, directory: string) {
  const webpackConfig = {
    context: directory,
    resolve: {
      modules: ['node_modules'],
    },
    entry: {
      vendors: [...dependencies, ...getVendorEntries(directory, dependencies)],
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
      new webpack.optimize.UglifyJsPlugin({ mangle: false })
    ]
  }

  const compiler = webpack(webpackConfig);

  return new Promise((resolve, reject) => {
    compiler.run((err) => {
      if (err) return reject(err);

      try {
        rewriteManifest(hash, directory, dependencies);
      } catch (e) {
        return reject(e);
      }

      resolve();
    });
  });
}
