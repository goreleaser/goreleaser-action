import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as context from './context';
import * as github from './github';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';
import * as semver from 'semver';

type VerificationLevel = 'checksum' | 'cosign';

export async function install(distribution: string, version: string): Promise<string> {
  const release: github.GitHubRelease = await github.getRelease(distribution, version);
  const tag = release.tag_name;
  const toolVersion = tag.replace(/^v/, '');
  const cosign = await io.which('cosign', false);
  const verificationLevel = cosign && supportsCosignBundle(tag) ? 'cosign' : 'checksum';

  const toolPath = findCachedTool(distribution, toolVersion, verificationLevel);
  if (toolPath) {
    core.info(`GoReleaser ${tag} found in the runner tool cache: ${toolPath}`);
    return getExePath(toolPath);
  }

  const filename = getFilename(distribution);
  const baseUrl = `https://github.com/goreleaser/${distribution}/releases/download/${tag}`;
  const downloadUrl = `${baseUrl}/${filename}`;

  core.info(`Downloading ${downloadUrl}`);
  const downloadPath: string = await tc.downloadTool(downloadUrl);
  core.debug(`Downloaded to ${downloadPath}`);

  const verified = await verifyChecksum(distribution, tag, downloadPath, filename, cosign);

  core.info('Extracting GoReleaser');
  let extPath: string;
  if (context.osPlat == 'win32') {
    let zipPath = downloadPath;
    if (!zipPath.endsWith('.zip')) {
      zipPath = `${downloadPath}.zip`;
      fs.renameSync(downloadPath, zipPath);
    }
    extPath = await tc.extractZip(zipPath);
  } else {
    extPath = await tc.extractTar(downloadPath);
  }
  core.debug(`Extracted to ${extPath}`);

  if (!verified) {
    return getExePath(extPath);
  }

  const cachePath: string = await tc.cacheDir(extPath, cacheToolName(distribution, verified), toolVersion);
  core.debug(`Cached to ${cachePath}`);

  return getExePath(cachePath);
}

const findCachedTool = (distribution: string, version: string, required: VerificationLevel): string => {
  const levels: VerificationLevel[] = required === 'cosign' ? ['cosign'] : ['cosign', 'checksum'];
  for (const level of levels) {
    const toolPath = tc.find(cacheToolName(distribution, level), version);
    if (toolPath) {
      return toolPath;
    }
  }
  return '';
};

const cacheToolName = (distribution: string, verification: VerificationLevel): string => {
  return `${distribution}-${verification}`;
};

const getExePath = (dir: string): string => {
  return path.join(dir, context.osPlat == 'win32' ? 'goreleaser.exe' : 'goreleaser');
};

export async function verifyChecksum(
  distribution: string,
  tag: string,
  archivePath: string,
  filename: string,
  cosign?: string
): Promise<VerificationLevel | undefined> {
  const baseUrl = `https://github.com/goreleaser/${distribution}/releases/download/${tag}`;
  let checksumsPath: string;
  try {
    core.info(`Downloading ${baseUrl}/checksums.txt`);
    checksumsPath = await tc.downloadTool(`${baseUrl}/checksums.txt`);
  } catch (e) {
    core.warning(`Skipping checksum verification: unable to download checksums.txt: ${e.message}`);
    return;
  }

  const sha256 = crypto.createHash('sha256').update(fs.readFileSync(archivePath)).digest('hex');
  const expected = findChecksum(fs.readFileSync(checksumsPath, 'utf8'), filename);
  if (!expected) {
    throw new Error(`Could not find ${filename} in checksums.txt`);
  }
  if (expected.toLowerCase() !== sha256.toLowerCase()) {
    throw new Error(`Checksum mismatch for ${filename}: expected ${expected}, got ${sha256}`);
  }
  core.info(`Checksum verified for ${filename}`);

  const cosignPath = cosign === undefined ? await io.which('cosign', false) : cosign;
  if (!cosignPath) {
    core.info('cosign not found in PATH, skipping signature verification');
    return 'checksum';
  }
  if (!supportsCosignBundle(tag)) {
    core.info(`GoReleaser ${tag} does not have a sigstore bundle, skipping signature verification`);
    return 'checksum';
  }
  if (!(await verifyCosignSignature(distribution, tag, baseUrl, checksumsPath, cosignPath))) {
    return 'checksum';
  }
  return 'cosign';
}

export const findChecksum = (checksumsContent: string, filename: string): string | undefined => {
  const match = checksumsContent
    .split('\n')
    .map(line => line.trim().split(/\s+/))
    .find(parts => parts.length >= 2 && parts[1].replace(/^[*]/, '') === filename);
  return match ? match[0] : undefined;
};

async function verifyCosignSignature(
  distribution: string,
  tag: string,
  baseUrl: string,
  checksumsPath: string,
  cosign: string
): Promise<boolean> {
  let bundlePath: string;
  try {
    core.info(`Downloading ${baseUrl}/checksums.txt.sigstore.json`);
    bundlePath = await tc.downloadTool(`${baseUrl}/checksums.txt.sigstore.json`);
  } catch (e) {
    core.warning(`Skipping cosign signature verification: unable to download sigstore bundle: ${e.message}`);
    return false;
  }

  const certificateIdentity = getCertificateIdentity(distribution, tag);
  core.info(`Verifying checksums.txt signature with cosign (identity: ${certificateIdentity})`);
  await exec.exec(cosign, [
    'verify-blob',
    '--certificate-identity',
    certificateIdentity,
    '--certificate-oidc-issuer',
    'https://token.actions.githubusercontent.com',
    '--bundle',
    bundlePath,
    checksumsPath
  ]);
  core.info('cosign signature verified');
  return true;
}

const supportsCosignBundle = (tag: string): boolean => {
  if (github.isNightlyTag(tag)) {
    return true;
  }
  const version = semver.parse(tag.replace(/^v/, '').replace(/-pro$/, ''));
  return version !== null && semver.gte(version, '2.13.0');
};

export const getCertificateIdentity = (distribution: string, tag: string): string => {
  const pro = isPro(distribution);
  if (github.isNightlyTag(tag)) {
    const workflow = pro ? 'nightly-pro.yml' : 'nightly-oss.yml';
    const repo = pro ? 'goreleaser-pro-internal' : 'goreleaser';
    return `https://github.com/goreleaser/${repo}/.github/workflows/${workflow}@refs/heads/main`;
  }
  if (pro) {
    return `https://github.com/goreleaser/goreleaser-pro-internal/.github/workflows/release-pro.yml@refs/tags/${tag}`;
  }
  return `https://github.com/goreleaser/goreleaser/.github/workflows/release.yml@refs/tags/${tag}`;
};

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
  return `goreleaser${suffix}_${platform}_${arch}.${ext}`;
};

export async function getDistPath(yamlfile: string): Promise<string> {
  const cfg = yaml.load(fs.readFileSync(yamlfile, 'utf8')) as {dist?: string};
  return cfg.dist || 'dist';
}

export async function getArtifacts(distpath: string): Promise<string | undefined> {
  const artifactsFile = path.join(distpath, 'artifacts.json');
  if (!fs.existsSync(artifactsFile)) {
    return undefined;
  }
  const content = fs.readFileSync(artifactsFile, {encoding: 'utf-8'}).trim();
  if (content === 'null') {
    return undefined;
  }
  return content;
}

export async function getMetadata(distpath: string): Promise<string | undefined> {
  const metadataFile = path.join(distpath, 'metadata.json');
  if (!fs.existsSync(metadataFile)) {
    return undefined;
  }
  const content = fs.readFileSync(metadataFile, {encoding: 'utf-8'}).trim();
  if (content === 'null') {
    return undefined;
  }
  return content;
}
