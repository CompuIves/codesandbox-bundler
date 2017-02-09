const getAuthorUsername = (author) => author != null ? author.username : 'anonymous';

export default (version) => ({
  name: `${getAuthorUsername(version.sandbox.author)}/${version.sandbox.slug}`,
  description: version.description || '',
  main: 'index.js',
  version: version.version,
  dependencies: version.npm_dependencies || {},
})
