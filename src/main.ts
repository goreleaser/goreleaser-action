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

    if (workdir && workdir !== '.') {
      console.log(`📂 Using ${workdir} as working directory...`);
      process.chdir(workdir);
    }

    if (key) {
      console.log('🔑 Importing signing key...');
      let path = `${process.env.HOME}/key.asc`;
      fs.writeFileSync(path, key, {mode: 0o600});
      await exec.exec('gpg', ['--import', path], {
        silent: silent
      });
    }

    console.log('🏃 Running GoReleaser...');
    await exec.exec(`${goreleaser} ${args}`, undefined, {
      silent: silent
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
