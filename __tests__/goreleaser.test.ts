import {describe, expect, it} from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import * as goreleaser from '../src/goreleaser';

const fixturesDir = path.join(__dirname, 'fixtures');

describe('install', () => {
  it('acquires v0.182.0 version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', 'v0.182.0');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);
  it('acquires latest version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', 'latest');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);
  it('acquires v0.182.0-pro version of GoReleaser Pro', async () => {
    const bin = await goreleaser.install('goreleaser-pro', 'v0.182.0-pro');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);
  it('acquires latest version of GoReleaser Pro', async () => {
    const bin = await goreleaser.install('goreleaser-pro', 'latest');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);
});

describe('distribSuffix', () => {
  it('suffixes pro distribution', async () => {
    expect(goreleaser.distribSuffix('goreleaser-pro')).toEqual('-pro');
  });
  it('does not suffix oss distribution', async () => {
    expect(goreleaser.distribSuffix('goreleaser')).toEqual('');
  });
});

describe('getDistPath', () => {
  it('none', async () => {
    expect(await goreleaser.getDistPath(path.join(fixturesDir, 'goreleaser-nodist.yaml'))).toEqual('dist');
  });
  it('set', async () => {
    expect(await goreleaser.getDistPath(path.join(fixturesDir, 'goreleaser-dist.yaml'))).toEqual('/bar');
  });
  it('anchors', async () => {
    expect(await goreleaser.getDistPath(path.join(fixturesDir, 'goreleaser-anchors.yml'))).toEqual('/foo');
  });
  it('invalid', async () => {
    await expect(goreleaser.getDistPath(path.join(fixturesDir, 'goreleaser-invalid.yaml'))).rejects.toThrow();
  });
});
