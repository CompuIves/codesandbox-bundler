jest.mock('./__mocks__/latest-version');
jest.mock('./__mocks__/package-json');

import { getAbsoluteVersion } from './version';

it('gets the latest version', async () => {
  const ctx = {};
  await getAbsoluteVersion(ctx, 'react', 'latest');
  expect(ctx.body.version).toEqual('15.0.0');
});

it('returns url if it\'s a url', async () => {
  const ctx = {};
  await getAbsoluteVersion(ctx, 'react', 'http://koekje.nl');
  expect(ctx.body.version).toEqual('http://koekje.nl');
});

it('returns right semver if it\'s a right semver', async () => {
  const ctx = {};
  await getAbsoluteVersion(ctx, 'react', '15.0.0');
  expect(ctx.body.version).toEqual('15.0.0');
});

it('returns wrong semver if it\'s a wrong semver', async () => {
  const ctx = {};
  try {
    await getAbsoluteVersion(ctx, 'react', '13.0.0');
  } catch (e) {
    expect(e.message).toEqual('Invalid version');
  }
});


