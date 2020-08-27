import * as exec from './exec';

const git = async (args: string[] = []): Promise<string> => {
  return await exec.exec(`git`, args, true).then(res => {
    if (res.stderr != '' && !res.success) {
      throw new Error(res.stderr);
    }
    return res.stdout.trim();
  });
};

export async function getTag(): Promise<string> {
  try {
    if ((process.env.GITHUB_REF || '').startsWith('refs/tags')) {
      const tag = (process.env.GITHUB_REF || '').split('/').pop();
      if (tag !== '' && tag !== undefined) {
        return tag;
      }
    }
    return await git(['tag', '--points-at', `${process.env.GITHUB_SHA}`, '--sort', '-version:creatordate']).then(
      tags => {
        if (tags.length == 0) {
          return git(['describe', '--tags', '--abbrev=0']);
        }
        return tags.split('\n')[0];
      }
    );
  } catch (err) {
    return '';
  }
}

export async function isTagDirty(currentTag: string): Promise<boolean> {
  try {
    await git(['describe', '--exact-match', '--tags', '--match', currentTag]);
  } catch (err) {
    return true;
  }
  return false;
}

export async function getShortCommit(): Promise<string> {
  return await git(['show', "--format='%h'", 'HEAD', '--quiet']);
}
