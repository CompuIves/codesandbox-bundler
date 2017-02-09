import * as fs from 'fs';

import { deleteDirectory } from '../utils/directories';
import generateFiles, { TEMP_ROOT } from './generate-files';

it('creates the right structure', async () => {
  const version = {
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
        code: 'hello world',
      }]
    }
  };

  await generateFiles(version);

  expect(fs.readdirSync(`${TEMP_ROOT}/anonymous/test/1.0.0`)).toEqual(['directory']);
  expect(fs.readFileSync(`${TEMP_ROOT}/anonymous/test/1.0.0/directory/firstmodule.js`).toString()).toEqual('hello world');
});

it('handles multiple files', async () => {
  const version = {
    version: '2.0.0',
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
        code: 'hello world',
      }, {
        directory_id: 1,
        title: 'aaaaaa.js',
        code: 'hello world2',
      }]
    }
  };

  await generateFiles(version);

  expect(fs.readdirSync(`${TEMP_ROOT}/anonymous/test/2.0.0`)).toEqual(['directory']);
  expect(fs.readFileSync(`${TEMP_ROOT}/anonymous/test/2.0.0/directory/firstmodule.js`).toString()).toEqual('hello world');
  expect(fs.readFileSync(`${TEMP_ROOT}/anonymous/test/2.0.0/directory/aaaaaa.js`).toString()).toEqual('hello world2');
});

it('handles nested files', async () => {
  const version = {
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
        code: 'hello world',
      }, {
        directory_id: 2,
        title: 'aaaaaa.js',
        code: 'hello world2',
      }]
    }
  };

  await generateFiles(version);

  expect(fs.readdirSync(`${TEMP_ROOT}/anonymous/test/3.0.0`)).toEqual(['directory']);
  expect(fs.readFileSync(`${TEMP_ROOT}/anonymous/test/3.0.0/directory/firstmodule.js`).toString()).toEqual('hello world');
  expect(fs.readFileSync(`${TEMP_ROOT}/anonymous/test/3.0.0/directory/hello/aaaaaa.js`).toString()).toEqual('hello world2');
});

it('handles multiple root directories', async () => {
  const version = {
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
        directory_id: null,
        title: 'directoryalso'
      }, {
        id: 2,
        directory_id: 1,
        title: 'hello'
      }],
      modules: [{
        directory_id: 1,
        title: 'firstmodule.js',
        code: 'hello world',
      }, {
        directory_id: 3,
        title: 'aaaaaa.js',
        code: 'hello world2',
      }]
    }
  };

  await generateFiles(version);

  expect(fs.readdirSync(`${TEMP_ROOT}/anonymous/test/4.0.0`)).toEqual(['directory', 'directoryalso']);
  expect(fs.readFileSync(`${TEMP_ROOT}/anonymous/test/4.0.0/directory/firstmodule.js`).toString()).toEqual('hello world');
  expect(fs.readFileSync(`${TEMP_ROOT}/anonymous/test/4.0.0/directoryalso/aaaaaa.js`).toString()).toEqual('hello world2');
});

it('handles multiple child directories', async () => {
  const version = {
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
        code: 'hello world',
      }, {
        directory_id: 3,
        title: 'aaaaaa.js',
        code: 'hello world2',
      }, {
        directory_id: 2,
        title: 'aaaaaa.js',
        code: 'hello world3',
      }]
    }
  };

  await generateFiles(version);

  expect(fs.readdirSync(`${TEMP_ROOT}/anonymous/test/4.0.0`)).toEqual(['directory']);
  expect(fs.readFileSync(`${TEMP_ROOT}/anonymous/test/4.0.0/directory/directoryalso/firstmodule.js`).toString()).toEqual('hello world');
  expect(fs.readFileSync(`${TEMP_ROOT}/anonymous/test/4.0.0/directory/directoryalso/aaaaaa.js`).toString()).toEqual('hello world2');
  expect(fs.readFileSync(`${TEMP_ROOT}/anonymous/test/4.0.0/directory/hello/aaaaaa.js`).toString()).toEqual('hello world3');
});

afterAll(() => deleteDirectory(TEMP_ROOT))
