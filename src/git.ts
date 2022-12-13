import * as exec from '@actions/exec';

const git = async (args: string[] = []): Promise<string> => {
  return await exec
    .getExecOutput(`git`, args, {
      ignoreReturnCode: true,
      silent: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
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

export async function getShortCommit(): Promise<string> {
  return await git(['show', "--format='%h'", 'HEAD', '--quiet']);
}
