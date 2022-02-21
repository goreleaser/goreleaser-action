import * as path from 'path';
import * as util from 'util';
import * as context from './context';
import * as github from './github';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

export async function install(distribution: string, version: string): Promise<string> {
  const release: github.GitHubRelease | null = await github.getRelease(distribution, version);
  if (!release) {
    throw new Error(`Cannot find GoReleaser ${version} release`);
  }

  const filename = getFilename(distribution);
  const downloadUrl = util.format(
    'https://github.com/goreleaser/%s/releases/download/%s/%s',
    distribution,
    release.tag_name,
    filename
  );

  core.info(`Downloading ${downloadUrl}`);
  const downloadPath: string = await tc.downloadTool(downloadUrl);
  core.debug(`Downloaded to ${downloadPath}`);

  core.info('Extracting GoReleaser');
  let extPath: string;
  if (context.osPlat == 'win32') {
    extPath = await tc.extractZip(downloadPath);
  } else {
    extPath = await tc.extractTar(downloadPath);
  }
  core.debug(`Extracted to ${extPath}`);

  const cachePath: string = await tc.cacheDir(extPath, 'goreleaser-action', release.tag_name.replace(/^v/, ''));
  core.debug(`Cached to ${cachePath}`);

  const exePath: string = path.join(cachePath, context.osPlat == 'win32' ? 'goreleaser.exe' : 'goreleaser');
  core.debug(`Exe path is ${exePath}`);

  return exePath;
}

export const distribSuffix = (distribution: string): string => {
  return isPro(distribution) ? '-pro' : '';
};

export const isPro = (distribution: string): boolean => {
  return distribution === 'goreleaser-pro';
};

const getFilename = (distribution: string): string => {
  let arch: string;
  switch (context.osArch) {
    case 'x64': {
      arch = 'x86_64';
      break;
    }
    case 'x32': {
      arch = 'i386';
      break;
    }
    case 'arm': {
      const arm_version = (process.config.variables as any).arm_version;
      arch = arm_version ? 'armv' + arm_version : 'arm';
      break;
    }
    default: {
      arch = context.osArch;
      break;
    }
  }
  if (context.osPlat == 'darwin') {
    arch = 'all';
  }
  const platform: string = context.osPlat == 'win32' ? 'Windows' : context.osPlat == 'darwin' ? 'Darwin' : 'Linux';
  const ext: string = context.osPlat == 'win32' ? 'zip' : 'tar.gz';
  const suffix: string = distribSuffix(distribution);
  return util.format('goreleaser%s_%s_%s.%s', suffix, platform, arch, ext);
};
