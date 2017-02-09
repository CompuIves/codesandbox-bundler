import { createHash } from './hashing';

it('creates a hash', () => {
  const hash = createHash({ test: 'b' });

  expect(hash).toEqual('1901684941');
});

it('creates a persistent hash', () => {
  expect(createHash({ test: 'b' })).toEqual('1901684941');
  expect(createHash({ test: 'b' })).toEqual('1901684941');
  expect(createHash({ test: 'a' })).toEqual('1169534574');
});

it('creates a persistent for different orders', () => {
  const a = {
    a: 'b',
    b: 'a'
  };
  const b = {
    b: 'a',
    a: 'b'
  };
  expect(createHash(a)).toEqual(createHash(b));
});
