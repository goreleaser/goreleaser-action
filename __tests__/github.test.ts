import * as github from '../src/github';

describe('github', () => {
  it('returns latest GoReleaser GitHub release', async () => {
    const release = await github.getRelease('latest');
    console.log(release);
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });
  it('returns v0.117.0 GoReleaser GitHub release', async () => {
    const release = await github.getRelease('v0.117.0');
    console.log(release);
    expect(release).not.toBeNull();
    expect(release?.tag_name).toEqual('v0.117.0');
  });
});
