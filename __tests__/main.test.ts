import * as fs from 'fs';
import {run} from '../src/main';

describe('main', () => {
  it('run GoReleaser', async () => {
    process.env['INPUT_ARGS'] = 'release --skip-publish --rm-dist';
    await run(true);
    expect(fs.existsSync('dist/checksums.txt')).toBe(true);
  }, 100000);
});
