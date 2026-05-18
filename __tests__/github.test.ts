import {describe, expect, it} from '@jest/globals';
import * as github from '../src/github';

describe('getRelease', () => {
  it('returns latest GoReleaser GitHub release', async () => {
    const release = await github.getRelease('goreleaser', 'latest');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });

  it('returns v0.182.0 GoReleaser GitHub release', async () => {
    const release = await github.getRelease('goreleaser', 'v0.182.0');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.182.0');
  });

  it('returns v0.182.1 GoReleaser GitHub release', async () => {
    const release = await github.getRelease('goreleaser', '~> 0.182');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.182.1');
  });

  it('unknown GoReleaser release', async () => {
    await expect(github.getRelease('goreleaser', 'foo')).rejects.toThrow(
      new Error('Cannot find GoReleaser release foo in https://goreleaser.com/releases.json')
    );
  });

  it('returns latest GoReleaser Pro GitHub release', async () => {
    const release = await github.getRelease('goreleaser-pro', 'latest');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });

  it('returns latest v1 GoReleaser Pro GitHub release', async () => {
    const release = await github.getRelease('goreleaser-pro', '~> v1');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });

  it('returns latest v1 GoReleaser GitHub release', async () => {
    const release = await github.getRelease('goreleaser', '~> v1');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });

  it('returns latest v2 GoReleaser Pro GitHub release', async () => {
    const release = await github.getRelease('goreleaser-pro', '~> v2');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });

  it('returns latest v2 GoReleaser GitHub release', async () => {
    const release = await github.getRelease('goreleaser', '~> v2');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });

  it('resolves nightly to a <version>-<sha>-nightly release for OSS GoReleaser', async () => {
    const release = await github.getRelease('goreleaser', 'nightly');
    expect(release).not.toBeNull();
    expect(release.tag_name).toMatch(github.nightlyTagRegex);
  });

  it('resolves nightly to a <version>-<sha>-nightly release for GoReleaser Pro', async () => {
    const release = await github.getRelease('goreleaser-pro', 'nightly');
    expect(release).not.toBeNull();
    expect(release.tag_name).toMatch(github.nightlyTagRegex);
  });

  it('returns v0.182.0 GoReleaser Pro GitHub release', async () => {
    const release = await github.getRelease('goreleaser-pro', 'v0.182.0');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.182.0-pro');
  });

  it('returns v0.182.1 GoReleaser Pro GitHub release', async () => {
    const release = await github.getRelease('goreleaser-pro', '~> 0.182');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.182.1-pro');
  });

  it('returns v2.7.0 GoReleaser Pro GitHub release', async () => {
    const release = await github.getRelease('goreleaser-pro', '~> v2.7');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v2.7.0');
  });

  it('skips JSON check for specific version v2.8.1', async () => {
    const release = await github.getRelease('goreleaser', 'v2.8.1');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v2.8.1');
  });

  it('skips JSON check for specific version without v prefix', async () => {
    const release = await github.getRelease('goreleaser', '2.8.1');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v2.8.1');
  });

  it('unknown GoReleaser Pro release', async () => {
    await expect(github.getRelease('goreleaser-pro', 'foo')).rejects.toThrow(
      new Error('Cannot find GoReleaser release foo in https://goreleaser.com/releases-pro.json')
    );
  });
});

describe('latestNightlyRelease', () => {
  it('returns the newest nightly by published_at even when API order is wrong', () => {
    const release = github.latestNightlyRelease([
      {tag_name: 'v2.16.0-c9b458fa-nightly', published_at: '2026-05-12T01:27:50Z'},
      {tag_name: 'v2.16.0-6724de64-nightly', published_at: '2026-05-13T01:32:53Z'},
      {tag_name: 'v2.16.0-2827930b-nightly', published_at: '2026-05-17T01:34:11Z'},
      {tag_name: 'v2.15.4', published_at: '2026-04-21T14:07:57Z'}
    ]);

    expect(release?.tag_name).toEqual('v2.16.0-2827930b-nightly');
  });
});
