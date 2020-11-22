import * as git from './git';
import * as installer from './installer';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import {dirname} from 'path';

async function run(): Promise<void> {
  try {
    const version = core.getInput('version') || 'latest';
    const args = core.getInput('args');
    const workdir = core.getInput('workdir') || '.';
    const isInstallOnly = /^true$/i.test(core.getInput('install-only'));
    const goreleaser = await installer.getGoReleaser(version);
    core.info(`✅ GoReleaser installed successfully`);

    if (isInstallOnly) {
      const goreleaserDir = dirname(goreleaser);
      core.addPath(goreleaserDir);
      core.debug(`Added ${goreleaserDir} to PATH`);
      return;
    } else if (!args) {
      throw new Error('args input required');
    }

    if (workdir && workdir !== '.') {
      core.info(`📂 Using ${workdir} as working directory...`);
      process.chdir(workdir);
    }

    const commit = await git.getShortCommit();
    const tag = await git.getTag();
    const isTagDirty = await git.isTagDirty(tag);

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
    process.env.GORELEASER_CURRENT_TAG = tag;
    await exec.exec(`${goreleaser} ${args}${snapshot}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
