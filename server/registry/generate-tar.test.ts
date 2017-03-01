import * as tar from 'tar-stream';
import { tmpdir } from 'os';

import generateTar from './generate-tar';

async function setup(version) {
  const packer = tar.pack();
  const entry = jest.fn((_, __, cb) => cb(null, true));
  packer.entry = entry;

  await generateTar(version, packer);

  return entry;
}

it("generates a correct tar", async () => {
  const entry = await setup({
    version: '1.0.0',
    sandbox: {
      slug: 'test'
    },
    source: {
      directories: [{
        id: 1,
        directory_id: null,
        title: 'directory'
      }],
      modules: [{
        directory_id: 1,
        title: 'firstmodule.js',
        code: 'const a = \'hello world\'',
      }]
    }
  });

  expect(entry.mock.calls.length).toEqual(4);
  expect(entry.mock.calls[0][0]).toEqual({"name": "package", "type": "directory"});
  expect(entry.mock.calls[1][0]).toEqual({"name": "package/directory", "type": "directory"});
  expect(entry.mock.calls[2][0]).toEqual({"name": "package/directory/firstmodule.js", "type": "file"});
  expect(entry.mock.calls[2][1].toString()).toEqual("\'use strict\';\n\nvar a = \'hello world\';");
  expect(entry.mock.calls[3][0]).toEqual({"name": "package/package.json", "type": "file"});
});

it("handles multiple files", async () => {
  const entry = await setup({
    version: '4.0.0',
    sandbox: {
      slug: 'test'
    },
    source: {
      directories: [{
        id: 1,
        directory_id: null,
        title: 'directory'
      }, {
        id: 3,
        directory_id: 1,
        title: 'directoryalso'
      }, {
        id: 2,
        directory_id: 1,
        title: 'hello'
      }],
      modules: [{
        directory_id: 3,
        title: 'firstmodule.js',
        code: 'const a = \'hello world\'',
      }, {
        directory_id: 3,
        title: 'aaaaaa.js',
        code: 'const b = \'hello world2\'',
      }, {
        directory_id: 2,
        title: 'aaaaaa.js',
        code: 'const c = \'hello world3\'',
      }]
    }
  });

  expect(entry.mock.calls.length).toEqual(8);

  const directories = entry.mock.calls.filter(c => c[0].type === 'directory').map(c => c[0].name);
  const files = entry.mock.calls.filter(c => c[0].type === 'file').map(c => c[0].name);

  expect(directories).toEqual(['package', 'package/directory', 'package/directory/directoryalso', 'package/directory/hello']);
  expect(files).toEqual([
    'package/directory/directoryalso/firstmodule.js',
    'package/directory/directoryalso/aaaaaa.js',
    'package/directory/hello/aaaaaa.js',
    'package/package.json',
  ]);
});

it('handles root files', async () => {
  const entry = await setup({
    version: '4.0.0',
    sandbox: {
      slug: 'test'
    },
    source: {
      directories: [{
        id: 1,
        directory_id: null,
        title: 'directory'
      }, {
        id: 3,
        directory_id: 1,
        title: 'directoryalso'
      }, {
        id: 2,
        directory_id: 1,
        title: 'hello'
      }],
      modules: [{
        directory_id: null,
        title: 'firstmodule.js',
        code: 'const a = \'hello world\'',
      }, {
        directory_id: null,
        title: 'aaaaaa.js',
        code: 'const b = \'hello world2\'',
      }, {
        directory_id: 2,
        title: 'aaaaaa.js',
        code: 'const c = \'hello world3\'',
      }]
    }
  });

  const directories = entry.mock.calls.filter(c => c[0].type === 'directory').map(c => c[0].name);
  const files = entry.mock.calls.filter(c => c[0].type === 'file').map(c => c[0].name);

  expect(directories).toEqual(['package', 'package/directory', 'package/directory/directoryalso', 'package/directory/hello']);
  expect(files).toEqual([
    'package/directory/hello/aaaaaa.js',
    'package/firstmodule.js',
    'package/aaaaaa.js',
    'package/package.json',
  ]);
});

it('handles multiple files', async () => {
  const entry = await setup({
    version: '3.0.0',
    sandbox: {
      slug: 'test'
    },
    source: {
      directories: [{
        id: 1,
        directory_id: null,
        title: 'directory'
      }, {
        id: 2,
        directory_id: 1,
        title: 'hello'
      }],
      modules: [{
        directory_id: 1,
        title: 'firstmodule.js',
        code: 'const a = \'hello world\'',
      }, {
        directory_id: 2,
        title: 'aaaaaa.js',
        code: 'const b = \'hello world2\'',
      }]
    }
  });

  const directories = entry.mock.calls.filter(c => c[0].type === 'directory').map(c => c[0].name);
  const files = entry.mock.calls.filter(c => c[0].type === 'file').map(c => c[0].name);

  expect(directories).toEqual(['package', 'package/directory', 'package/directory/hello']);
  expect(files).toEqual([
    'package/directory/hello/aaaaaa.js',
    'package/directory/firstmodule.js',
    'package/package.json',
  ]);
})
