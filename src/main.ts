import * as git from './git';
import * as installer from './installer';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run(): Promise<void> {
  try {
    const version = core.getInput('version') || 'latest';
    const args = core.getInput('args', {required: true});
    const workdir = core.getInput('workdir') || '.';
    const goreleaser = await installer.getGoReleaser(version);

    const commit = await git.getShortCommit();
    const tag = await git.getTag();
    const isTagDirty = await git.isTagDirty(tag);

    if (workdir && workdir !== '.') {
      core.info(`📂 Using ${workdir} as working directory...`);
      process.chdir(workdir);
    }

    let snapshot = '';
    if (args.split(' ').indexOf('release') > -1) {
      if (isTagDirty) {
        core.info(`⚠️ No tag found for commit ${commit}. Snapshot forced`);
        if (!args.includes('--snapshot')) {
          snapshot = ' --snapshot';
        }
      } else {
        core.info(`✅ ${tag} tag found for commit ${commit}`);
      }
    }

    core.info('🏃 Running GoReleaser...');
    await exec.exec(`${goreleaser} ${args}${snapshot}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
