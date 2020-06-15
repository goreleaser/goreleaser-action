import * as git from '../src/git';

describe('git', () => {
  it('returns git tag', async () => {
    const tag: string = await git.getTag();
    expect(tag).not.toEqual('');
  });
  it('checks if tag is dirty', async () => {
    expect(await git.isTagDirty('v1.3.1')).toBe(true);
  });
  it('returns short commit', async () => {
    const commit: string = await git.getShortCommit();
    expect(commit).not.toEqual('');
  });
});
