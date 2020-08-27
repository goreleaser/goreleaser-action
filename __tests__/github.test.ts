import * as github from '../src/github';

describe('github', () => {
  it('returns latest GoReleaser GitHub release', async () => {
    const release = await github.getRelease('latest');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
    console.log(`tag_name: ${release?.tag_name}`);
  });
  it('returns v0.117.0 GoReleaser GitHub release', async () => {
    const release = await github.getRelease('v0.117.0');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.117.0');
  });
  it('returns v0.132.1 GoReleaser GitHub release', async () => {
    const release = await github.getRelease('~> 0.132');
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.132.1');
  });
});
