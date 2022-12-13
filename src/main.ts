import * as fs from 'fs';
import * as path from 'path';
import yargs from 'yargs';
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

    let yamlfile: string | unknown;
    const argv = yargs.parse(inputs.args);
    if (argv.config) {
      yamlfile = argv.config;
    } else {
      ['.goreleaser.yaml', '.goreleaser.yml', 'goreleaser.yaml', 'goreleaser.yml'].forEach(f => {
        if (fs.existsSync(f)) {
          yamlfile = f;
        }
      });
    }

    if (inputs.args.split(' ').indexOf('release') > -1) {
      core.info(`${tag} tag found for commit ${commit}`);
    }

    await exec.exec(`${bin} ${inputs.args}`);

    if (typeof yamlfile === 'string') {
      const artifacts = await goreleaser.getArtifacts(await goreleaser.getDistPath(yamlfile));
      if (artifacts) {
        await core.group(`Artifacts output`, async () => {
          core.info(artifacts);
          core.setOutput('artifacts', artifacts);
        });
      }
      const metadata = await goreleaser.getMetadata(await goreleaser.getDistPath(yamlfile));
      if (metadata) {
        await core.group(`Metadata output`, async () => {
          core.info(metadata);
          core.setOutput('metadata', metadata);
        });
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
