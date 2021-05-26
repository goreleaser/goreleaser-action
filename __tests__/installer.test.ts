import fs = require('fs');
import * as installer from '../src/installer';

describe('installer', () => {
  it('acquires v0.117.0 version of GoReleaser', async () => {
    const goreleaser = await installer.getGoReleaser('goreleaser', 'v0.117.0');
    expect(fs.existsSync(goreleaser)).toBe(true);
  }, 100000);

  it('acquires latest version of GoReleaser', async () => {
    const goreleaser = await installer.getGoReleaser('goreleaser', 'latest');
    expect(fs.existsSync(goreleaser)).toBe(true);
  }, 100000);

  it('acquires v0.166.0-pro version of GoReleaser Pro', async () => {
    const goreleaser = await installer.getGoReleaser('goreleaser-pro', 'v0.166.0-pro');
    expect(fs.existsSync(goreleaser)).toBe(true);
  }, 100000);

  it('acquires latest version of GoReleaser Pro', async () => {
    const goreleaser = await installer.getGoReleaser('goreleaser-pro', 'latest');
    expect(fs.existsSync(goreleaser)).toBe(true);
  }, 100000);
});
