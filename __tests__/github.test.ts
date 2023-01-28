import {describe, expect, it} from '@jest/globals';
import * as github from '../src/github';

describe('github', () => {
  it('returns latest GoReleaser GitHub release', async () => {
    const githubToken = process.env.GITHUB_TOKEN || '';
    const release = await github.getRelease('goreleaser', 'latest', githubToken);
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });

  it('returns v0.182.0 GoReleaser GitHub release', async () => {
    const githubToken = process.env.GITHUB_TOKEN || '';
    const release = await github.getRelease('goreleaser', 'v0.182.0', githubToken);
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.182.0');
  });

  it('returns v0.182.1 GoReleaser GitHub release', async () => {
    const githubToken = process.env.GITHUB_TOKEN || '';
    const release = await github.getRelease('goreleaser', '~> 0.182', githubToken);
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.182.1');
  });

  it('returns latest GoReleaser Pro GitHub release', async () => {
    const githubToken = process.env.GITHUB_TOKEN || '';
    const release = await github.getRelease('goreleaser-pro', 'latest', githubToken);
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });

  it('returns v0.182.0-pro GoReleaser Pro GitHub release', async () => {
    const githubToken = process.env.GITHUB_TOKEN || '';
    const release = await github.getRelease('goreleaser-pro', 'v0.182.0-pro', githubToken);
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.182.0-pro');
  });

  it('returns v0.182.1-pro GoReleaser Pro GitHub release when using semver', async () => {
    const githubToken = process.env.GITHUB_TOKEN || '';
    const release = await github.getRelease('goreleaser-pro', '~> 0.182', githubToken);
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.182.1-pro');
  });
});
