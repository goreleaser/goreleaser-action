import * as child_process from 'child_process';

const git = async (args: string[] = []) => {
  const stdout = child_process.execSync(`git ${args.join(' ')}`, {
    encoding: 'utf8'
  });
  return stdout.trim();
};

export async function getTag(): Promise<string> {
  try {
    return await git(['describe', '--tags', '--abbrev=0']);
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
