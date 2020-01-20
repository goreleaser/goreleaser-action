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
    const skipSnapshotCheck = core.getInput('skip_snapshot_check') === 'true';
    const goreleaser = await installer.getGoReleaser(version);

    if (workdir && workdir !== '.') {
      console.log(`📂 Using ${workdir} as working directory...`);
      process.chdir(workdir);
    }

    let snapshot = '';
    if (skipSnapshotCheck) {
      console.log(`✅ --snapshot check is skipped`);
    } else {
      if (!process.env.GITHUB_REF || !process.env.GITHUB_REF.startsWith('refs/tags/')) {
        console.log(`⚠️ No tag found. Snapshot forced`);
        if (!args.includes('--snapshot')) {
          snapshot = ' --snapshot';
        }
      } else {
        console.log(`✅ ${process.env.GITHUB_REF!.split('/')[2]} tag found`);
      }
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
    await exec.exec(`${goreleaser} ${args}${snapshot}`, undefined, {
      silent: silent
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
