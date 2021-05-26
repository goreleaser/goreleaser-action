import * as github from '../src/github';

describe('github', () => {
  it('suffixes pro distribution', async () => {
    expect(github.suffix('goreleaser-pro')).toEqual('-pro');
  });
  it('does not suffix oss distribution', async () => {
    expect(github.suffix('goreleaser')).toEqual('');
  });
  it('returns latest GoReleaser GitHub release', async () => {
    const release = await github.getRelease('goreleaser', 'latest');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });
  it('returns v0.117.0 GoReleaser GitHub release', async () => {
    const release = await github.getRelease('goreleaser', 'v0.117.0');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.117.0');
  });
  it('returns v0.132.1 GoReleaser GitHub release', async () => {
    const release = await github.getRelease('goreleaser', '~> 0.132');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.132.1');
  });
  it('returns latest GoReleaser Pro GitHub release', async () => {
    const release = await github.getRelease('goreleaser-pro', 'latest');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });
  it('returns v0.166.0-pro GoReleaser Pro GitHub release', async () => {
    const release = await github.getRelease('goreleaser-pro', 'v0.166.0-pro');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.166.0-pro');
  });
  it('returns v0.166.0-pro GoReleaser Pro GitHub release when using semver', async () => {
    const release = await github.getRelease('goreleaser-pro', '~> 0.166');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.166.0-pro');
  });
});
