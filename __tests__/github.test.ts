import * as github from '../src/github';

describe('github', () => {
  it('returns latest GoReleaser GitHub release', async () => {
    process.env.GORELEASER_KEY = '';
    const release = await github.getRelease('latest');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });
  it('returns v0.117.0 GoReleaser GitHub release', async () => {
    process.env.GORELEASER_KEY = '';
    const release = await github.getRelease('v0.117.0');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.117.0');
  });
  it('returns v0.132.1 GoReleaser GitHub release', async () => {
    process.env.GORELEASER_KEY = '';
    const release = await github.getRelease('~> 0.132');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.132.1');
  });
  it('returns latest GoReleaser Pro GitHub release', async () => {
    process.env.GORELEASER_KEY = 'key';
    const release = await github.getRelease('latest');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });
  it('returns v0.166.0-pro GoReleaser Pro GitHub release', async () => {
    process.env.GORELEASER_KEY = 'key';
    const release = await github.getRelease('v0.166.0-pro');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.166.0-pro');
  });
  it('returns v0.166.0-pro GoReleaser Pro GitHub release when using semver', async () => {
    process.env.GORELEASER_KEY = 'key';
    const release = await github.getRelease('~> 0.166');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.166.0-pro');
  });
});
