import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as context from './context';
import * as github from './github';
import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';

export async function install(distribution: string, version: string, cacheBinary = false): Promise<string> {
  const release: github.GitHubRelease = await github.getRelease(distribution, version);
  const tag = release.tag_name;
  const toolVersion = tag.replace(/^v/, '');

  const toolPath = tc.find(distribution, toolVersion);
  if (toolPath) {
    core.info(`GoReleaser ${tag} found in the runner tool cache: ${toolPath}`);
    return getExePath(toolPath);
  }

  const filename = getFilename(distribution);
  const extPath = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'goreleaser-action', distribution, toolVersion);
  const useCache = cacheBinary && cache.isFeatureAvailable();
  // The GitHub Actions cache is shared by every runner of a repository, so the
  // key must pin the distribution, platform and architecture. The release
  // filename already encodes all three.
  const cacheKey = `goreleaser-action-${tag}-${filename}`;

  if (useCache && (await restoreCache(cacheKey, extPath))) {
    return getExePath(await tc.cacheDir(extPath, distribution, toolVersion));
  }

  const baseUrl = `https://github.com/goreleaser/${distribution}/releases/download/${tag}`;
  const downloadUrl = `${baseUrl}/${filename}`;

  core.info(`Downloading ${downloadUrl}`);
  const downloadPath: string = await tc.downloadTool(downloadUrl);
  core.debug(`Downloaded to ${downloadPath}`);

  await verifyChecksum(distribution, tag, downloadPath, filename);

  core.info('Extracting GoReleaser');
  await io.rmRF(extPath);
  if (context.osPlat == 'win32') {
    let zipPath = downloadPath;
    if (!zipPath.endsWith('.zip')) {
      zipPath = `${downloadPath}.zip`;
      fs.renameSync(downloadPath, zipPath);
    }
    await tc.extractZip(zipPath, extPath);
  } else {
    await tc.extractTar(downloadPath, extPath);
  }
  core.debug(`Extracted to ${extPath}`);

  if (useCache) {
    await saveCache(cacheKey, extPath);
  }

  const cachePath: string = await tc.cacheDir(extPath, distribution, toolVersion);
  core.debug(`Cached to ${cachePath}`);

  return getExePath(cachePath);
}

const getExePath = (dir: string): string => {
  return path.join(dir, context.osPlat == 'win32' ? 'goreleaser.exe' : 'goreleaser');
};

async function restoreCache(key: string, dest: string): Promise<boolean> {
  try {
    const hit = await cache.restoreCache([dest], key);
    if (!hit) {
      core.info(`No GitHub Actions cache entry for ${key}`);
      return false;
    }
    if (!fs.existsSync(getExePath(dest))) {
      core.warning(`Ignoring incomplete GitHub Actions cache entry ${hit}`);
      await io.rmRF(dest);
      return false;
    }
    core.info(`Restored ${hit} from the GitHub Actions cache`);
    return true;
  } catch (e) {
    logCacheError(`Unable to restore ${key} from the GitHub Actions cache`, e);
    return false;
  }
}

async function saveCache(key: string, src: string): Promise<void> {
  try {
    await cache.saveCache([src], key);
    core.info(`Saved ${key} to the GitHub Actions cache`);
  } catch (e) {
    logCacheError(`Unable to save ${key} to the GitHub Actions cache`, e);
  }
}

// A read-only cache token (fork pull requests) and a key already reserved by a
// concurrent job are expected, so they must not raise a warning annotation.
const logCacheError = (message: string, e: Error): void => {
  const expected = e instanceof cache.ReserveCacheError || e instanceof cache.CacheReadDeniedError;
  (expected ? core.info : core.warning)(`${message}: ${e.message}`);
};

export async function verifyChecksum(
  distribution: string,
  tag: string,
  archivePath: string,
  filename: string
): Promise<void> {
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

  await verifyCosignSignature(distribution, tag, baseUrl, checksumsPath);
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
  checksumsPath: string
): Promise<void> {
  const cosign = await io.which('cosign', false);
  if (!cosign) {
    core.info('cosign not found in PATH, skipping signature verification');
    return;
  }

  let bundlePath: string;
  try {
    core.info(`Downloading ${baseUrl}/checksums.txt.sigstore.json`);
    bundlePath = await tc.downloadTool(`${baseUrl}/checksums.txt.sigstore.json`);
  } catch (e) {
    core.warning(`Skipping cosign signature verification: unable to download sigstore bundle: ${e.message}`);
    return;
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
}

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
