import * as path from 'path';
import * as context from './context';
import * as git from './git';
import * as goreleaser from './goreleaser';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run(): Promise<void> {
  try {
    const inputs: context.Inputs = await context.getInputs();
    const bin = await goreleaser.install(inputs.distribution, inputs.version);
    core.info(`GoReleaser ${inputs.version} installed successfully`);

    if (inputs.installOnly) {
      const goreleaserDir = path.dirname(bin);
      core.addPath(goreleaserDir);
      core.debug(`Added ${goreleaserDir} to PATH`);
      return;
    } else if (!inputs.args) {
      core.setFailed('args input required');
      return;
    }

    if (inputs.workdir && inputs.workdir !== '.') {
      core.info(`Using ${inputs.workdir} as working directory`);
      process.chdir(inputs.workdir);
    }

    const commit = await git.getShortCommit();
    const tag = await git.getTag();
    const isTagDirty = await git.isTagDirty(tag);

    let snapshot = '';
    if (inputs.args.split(' ').indexOf('release') > -1) {
      if (isTagDirty) {
        if (!inputs.args.includes('--snapshot') && !inputs.args.includes('--nightly')) {
          core.info(`No tag found for commit ${commit}. Snapshot forced`);
          snapshot = ' --snapshot';
        }
      } else {
        core.info(`${tag} tag found for commit ${commit}`);
      }
    }

    await exec.exec(`${bin} ${inputs.args}${snapshot}`, undefined, {
      env: Object.assign({}, process.env, {
        GORELEASER_CURRENT_TAG: tag || process.env.GORELEASER_CURRENT_TAG || ''
      }) as {
        [key: string]: string;
      }
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
