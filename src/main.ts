import * as installer from './installer';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

export async function run(silent?: boolean) {
  try {
    const version = core.getInput('version') || 'latest';
    const args = core.getInput('args');
    const goreleaser = await installer.getGoReleaser(version);

    let snapshot = '';
    if (
      !process.env.GITHUB_REF ||
      !process.env.GITHUB_REF.startsWith('refs/tags/')
    ) {
      console.log(`⚠️ No tag found. Snapshot forced`);
      if (!args.includes('--snapshot')) {
        snapshot = ' --snapshot';
      }
    } else {
      console.log(`✅ ${process.env.GITHUB_REF!.split('/')[2]} tag found`);
    }

    console.log('🏃 Running GoReleaser...');
    await exec.exec(`${goreleaser} ${args}${snapshot}`, undefined, {
      silent: silent
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
