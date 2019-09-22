import * as fs from 'fs';
import * as io from '@actions/io';
import {run} from '../src/main';

describe('main', () => {
  beforeEach(async () => {
    await io.rmRF('dist');
  }, 100000);

  it('build with v0.117.0', async () => {
    process.env['INPUT_VERSION'] = 'v0.117.0';
    process.env['INPUT_ARGS'] = 'release --skip-publish --rm-dist';
    await run(true);
    expect(fs.existsSync('dist/checksums.txt')).toBe(true);
  }, 100000);

  it('build with latest', async () => {
    process.env['INPUT_ARGS'] = 'release --skip-publish --rm-dist';
    await run(true);
    expect(fs.existsSync('dist/checksums.txt')).toBe(true);
  }, 100000);
});
