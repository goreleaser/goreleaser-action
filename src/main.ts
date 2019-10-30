import * as installer from './installer';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';
import { default as Octokit } from '@octokit/rest';

export async function run(silent?: boolean) {
  try {
    const version = core.getInput('version') || 'latest';
    const args = core.getInput('args');
    const key = core.getInput('key');
    const goreleaser = await installer.getGoReleaser(version);

    let snapshot = '';
    const octokit = new Octokit();
    if (!process.env.GITHUB_REPOSITORY) {
      core.setFailed('$GITHUB_REPOSITORY was empty');
    }
    const [owner, repo] = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/') : ['', ''];
    const {data: tags} = await octokit.repos.listTags({
      owner,
      repo
    });
    if (!tags) {
      console.log(`⚠️ No tag found. Snapshot forced`);
      if (!args.includes('--snapshot')) {
        snapshot = ' --snapshot';
      }
    } else {
      const latestTag = tags[0].name;
      console.log(`✅ ${latestTag} tag found`);
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
