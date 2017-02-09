module.exports = function packageJson(packageName, version) {
  if (version !== '15.0.0') {
    throw new Error('Invalid version');
  }

  return {
    version: '15.0.0',
  };
}
