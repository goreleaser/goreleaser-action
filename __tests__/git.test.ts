import * as git from '../src/git';

describe('git', () => {
  it('returns git tag through describe', async () => {
    process.env.GITHUB_SHA = '309312125ed7a32fcd48f3a1e24dcafe669c186a';
    const tag: string = await git.getTag();
    console.log(`tag: ${tag}`);
    expect(tag).not.toEqual('');
  });
  it('returns git tag through GITHUB_SHA', async () => {
    process.env.GITHUB_SHA = '6e37040623d14330555c7be1603a9182cf92d32a';
    const tag: string = await git.getTag();
    console.log(`tag: ${tag}`);
    expect(tag).toEqual('v1');
  });
  it('returns git tag through GITHUB_REF', async () => {
    process.env.GITHUB_REF = 'refs/tags/v2.2.1';
    const tag: string = await git.getTag();
    console.log(`tag: ${tag}`);
    expect(tag).toEqual('v2.2.1');
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
