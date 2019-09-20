import * as installer from './installer';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run() {
  try {
    const version = core.getInput('version') || 'latest';
    const args = core.getInput('args');
    const goreleaser = await installer.getGoReleaser(version);

    console.log('🏃 Running GoReleaser...');
    await exec.exec(`${goreleaser} ${args}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
