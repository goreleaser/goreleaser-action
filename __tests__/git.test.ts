import * as git from '../src/git';

describe('git', () => {
  it('returns git tag', async () => {
    const tag: string = await git.getTag();
    console.log(`tag: ${tag}`);
    expect(tag).not.toEqual('');
  });
  it('checks if tag is dirty', async () => {
    expect(await git.isTagDirty('v1.3.1')).toBe(true);
  });
  it('returns short commit', async () => {
    const commit: string = await git.getShortCommit();
    console.log(`commit: ${commit}`);
    expect(commit).not.toEqual('');
  });
});
