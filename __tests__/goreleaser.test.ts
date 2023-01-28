import {describe, expect, it} from '@jest/globals';
import * as fs from 'fs';
import * as goreleaser from '../src/goreleaser';

describe('install', () => {
  it('acquires v0.182.0 version of GoReleaser', async () => {
    const githubToken = process.env.GITHUB_TOKEN || '';
    const bin = await goreleaser.install('goreleaser', 'v0.182.0', githubToken);
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires latest version of GoReleaser', async () => {
    const githubToken = process.env.GITHUB_TOKEN || '';
    const bin = await goreleaser.install('goreleaser', 'latest', githubToken);
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires v0.182.0-pro version of GoReleaser Pro', async () => {
    const githubToken = process.env.GITHUB_TOKEN || '';
    const bin = await goreleaser.install('goreleaser-pro', 'v0.182.0-pro', githubToken);
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires latest version of GoReleaser Pro', async () => {
    const githubToken = process.env.GITHUB_TOKEN || '';
    const bin = await goreleaser.install('goreleaser-pro', 'latest', githubToken);
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
