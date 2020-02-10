import * as git from './git';
import * as installer from './installer';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';

export async function run(silent?: boolean) {
  try {
    const version = core.getInput('version') || 'latest';
    const args = core.getInput('args');
    const key = core.getInput('key');
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
    if (args.includes('release')) {
      if (isTagDirty) {
        core.info(`⚠️ No tag found for commit ${commit}. Snapshot forced`);
        if (!args.includes('--snapshot')) {
          snapshot = ' --snapshot';
        }
      } else {
        core.info(`✅ ${tag} tag found for commit ${commit}`);
      }
    }

    if (key) {
      core.info('🔑 Importing signing key...');
      let path = `${process.env.HOME}/key.asc`;
      fs.writeFileSync(path, key, {mode: 0o600});
      await exec.exec('gpg', ['--import', path], {
        silent: silent
      });
    }

    core.info('🏃 Running GoReleaser...');
    await exec.exec(`${goreleaser} ${args}${snapshot}`, undefined, {
      silent: silent
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
