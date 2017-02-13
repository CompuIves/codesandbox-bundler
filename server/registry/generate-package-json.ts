import getAuthorUsername from './utils/author-name';

export default (version) => ({
  name: `@codesandbox/${getAuthorUsername(version.sandbox.author)}-${version.sandbox.slug}`.toLowerCase(),
  description: version.description || '',
  main: 'index.js',
  version: version.version,
  dependencies: version.npm_dependencies || {},
})
