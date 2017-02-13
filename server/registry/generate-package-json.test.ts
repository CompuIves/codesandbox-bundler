import generatePackageJson from './generate-package-json';

it('works without author', () => {
  const version = {
    version: '1.0.0',
    description: 'koekje',
    npm_dependencies: {},
    sandbox: {
      slug: 'cookie'
    }
  };

  const expected = {
    name: 'anonymous/cookie',
    description: 'koekje',
    main: 'index.js',
    dependencies: {},
    version: '1.0.0',
  };

  expect(generatePackageJson(version)).toEqual(expected);
});

it('lowercases the title', () => {
  const version = {
    version: '1.0.0',
    description: 'koekje',
    npm_dependencies: {},
    sandbox: {
      slug: 'Cookie',
      author: {
        username: "Koekje"
      }
    },
  };

  const expected = {
    name: 'koekje/cookie',
    description: 'koekje',
    main: 'index.js',
    dependencies: {},
    version: '1.0.0',
  };

  expect(generatePackageJson(version)).toEqual(expected);
});


it('lists empty dependency object if it\'s null', () => {
  const version = {
    version: '1.0.0',
    description: 'koekje',
    sandbox: {
      slug: 'cookie'
    }
  };

  const expected = {
    name: 'anonymous/cookie',
    description: 'koekje',
    main: 'index.js',
    dependencies: {},
    version: '1.0.0',
  };

  expect(generatePackageJson(version)).toEqual(expected);
});

it('works with author', () => {
  const version = {
    version: '1.0.0',
    description: 'koekje',
    npm_dependencies: {},
    sandbox: {
      slug: 'cookie',
      author: {
        username: 'ives'
      }
    }
  };

  const expected = {
    name: 'ives/cookie',
    description: 'koekje',
    main: 'index.js',
    dependencies: {},
    version: '1.0.0',
  };

  expect(generatePackageJson(version)).toEqual(expected);
});
