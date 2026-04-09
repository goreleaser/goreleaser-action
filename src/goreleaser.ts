import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as crypto from 'crypto';
import * as fs from 'fs';
import yaml from 'js-yaml';
import * as path from 'path';
import * as semver from 'semver';
import * as util from 'util';
import { checksums } from './checksums';
import * as context from './context';
import * as github from './github';

export async function install(distribution: string, version: string): Promise<string> {
  const release: github.GitHubRelease = await github.getRelease(distribution, version);
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

  const isExactVersion = !!semver.valid(version);
  if (isExactVersion) {
    core.info('Verifying checksum');
    const versionChecksums = checksums[release.tag_name];
    if (!versionChecksums) {
      throw new Error(`Checksums for version ${release.tag_name} not found.`);
    }
    const expectedChecksum = versionChecksums[filename];
    if (!expectedChecksum) {
      throw new Error(`Checksum for ${filename} at version ${release.tag_name} not found.`);
    }
    await verifyChecksum(downloadPath, expectedChecksum);
  } else {
    core.info('Skipping checksum verification since a specific version was not requested');
  }

  core.info('Extracting GoReleaser');
  let extPath: string;
  if (context.osPlat == 'win32') {
    if (!downloadPath.endsWith('.zip')) {
      const newPath = downloadPath + '.zip';
      fs.renameSync(downloadPath, newPath);
      extPath = await tc.extractZip(newPath);
    } else {
      extPath = await tc.extractZip(downloadPath);
    }
  } else {
    extPath = await tc.extractTar(downloadPath);
  }
  core.debug(`Extracted to ${extPath}`);

  const cachePath: string = await tc.cacheDir(extPath, 'goreleaser-action', release.tag_name.replace(/^v/, ''));
  core.debug(`Cached to ${cachePath}`);

  let exePath: string = path.join(cachePath, context.osPlat == 'win32' ? 'goreleaser.exe' : 'goreleaser');
  if (!fs.existsSync(exePath)) {
    exePath = path.join(cachePath, context.osPlat == 'win32' ? 'goreleaser-pro.exe' : 'goreleaser-pro');
  }
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function getDistPath(yamlfile: string): Promise<string> {
  const cfg = yaml.load(await fs.promises.readFile(yamlfile, 'utf8')) as { dist?: string };
  return cfg?.dist || 'dist';
}

export async function getArtifacts(distpath: string): Promise<string | undefined> {
  const artifactsFile = path.join(distpath, 'artifacts.json');
  if (!fs.existsSync(artifactsFile)) {
    return undefined;
  }
  const content = (await fs.promises.readFile(artifactsFile, {encoding: 'utf-8'})).trim();
  if (content === 'null') {
    return undefined;
  }
  return content;
}

export async function verifyChecksum(filePath: string, expectedChecksum: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', data => hash.update(data));
    stream.on('end', () => {
      const actualChecksum = hash.digest('hex');
      if (actualChecksum !== expectedChecksum) {
        reject(new Error(`Checksum mismatch. Expected ${expectedChecksum}, got ${actualChecksum}`));
      } else {
        resolve();
      }
    });
    stream.on('error', err => reject(err));
  });
}

export async function getMetadata(distpath: string): Promise<string | undefined> {
  const metadataFile = path.join(distpath, 'metadata.json');
  if (!fs.existsSync(metadataFile)) {
    return undefined;
  }
  const content = (await fs.promises.readFile(metadataFile, {encoding: 'utf-8'})).trim();
  if (content === 'null') {
    return undefined;
  }
  return content;
}
