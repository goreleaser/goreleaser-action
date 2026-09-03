import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const find = jest.fn<(tool: string, version: string) => string>();
const downloadTool = jest.fn<(url: string) => Promise<string>>();
const extractTar = jest.fn<(archive: string) => Promise<string>>();
const extractZip = jest.fn<(archive: string) => Promise<string>>();
const cacheDir = jest.fn<(source: string, tool: string, version: string) => Promise<string>>();
const which = jest.fn<(tool: string, check: boolean) => Promise<string>>();
const exec = jest.fn<(command: string, args: string[]) => Promise<number>>();

jest.unstable_mockModule('@actions/tool-cache', () => ({
  find,
  downloadTool,
  extractTar,
  extractZip,
  cacheDir
}));
jest.unstable_mockModule('@actions/io', () => ({which}));
jest.unstable_mockModule('@actions/exec', () => ({exec}));

const goreleaser = await import('../src/goreleaser');

describe('runner tool cache verification', () => {
  let tempDir: string;
  let archivePath: string;
  let checksumsPath: string;
  let bundlePath: string;
  let extractedPath: string;
  let cosignPath: string;
  let cache: Map<string, string>;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goreleaser-cache-'));
    archivePath = path.join(tempDir, 'archive');
    checksumsPath = path.join(tempDir, 'checksums.txt');
    bundlePath = path.join(tempDir, 'checksums.txt.sigstore.json');
    extractedPath = path.join(tempDir, 'extracted');
    fs.writeFileSync(archivePath, 'archive');
    fs.writeFileSync(bundlePath, '{}');
    fs.mkdirSync(extractedPath);

    const checksum = crypto.createHash('sha256').update('archive').digest('hex');
    fs.writeFileSync(
      checksumsPath,
      [
        `${checksum}  goreleaser_Linux_x86_64.tar.gz`,
        `${checksum}  goreleaser_Darwin_all.tar.gz`,
        `${checksum}  goreleaser_Windows_x86_64.zip`
      ].join('\n')
    );

    cosignPath = '';
    cache = new Map();
    find.mockImplementation((tool, version) => cache.get(`${tool}:${version}`) || '');
    downloadTool.mockImplementation(async url => {
      if (url.endsWith('/checksums.txt')) {
        return checksumsPath;
      }
      if (url.endsWith('/checksums.txt.sigstore.json')) {
        return bundlePath;
      }
      return archivePath;
    });
    extractTar.mockResolvedValue(extractedPath);
    extractZip.mockResolvedValue(extractedPath);
    cacheDir.mockImplementation(async (_source, tool, version) => {
      const destination = path.join(tempDir, tool, version);
      cache.set(`${tool}:${version}`, destination);
      return destination;
    });
    which.mockImplementation(async () => cosignPath);
    exec.mockResolvedValue(0);
  });

  afterEach(() => {
    fs.rmSync(tempDir, {recursive: true, force: true});
  });

  it('does not cache a binary when checksum verification is skipped', async () => {
    downloadTool.mockImplementation(async url => {
      if (url.endsWith('/checksums.txt')) {
        throw new Error('checksums unavailable');
      }
      return archivePath;
    });

    await goreleaser.install('goreleaser', 'v2.15.3');
    await goreleaser.install('goreleaser', 'v2.15.3');

    expect(cacheDir).not.toHaveBeenCalled();
    expect(downloadTool.mock.calls.filter(([url]) => !url.endsWith('/checksums.txt'))).toHaveLength(2);
  });

  it('does not reuse a checksum-only entry when cosign becomes available', async () => {
    await goreleaser.install('goreleaser', 'v2.15.3');
    expect(cacheDir).toHaveBeenLastCalledWith(extractedPath, 'goreleaser-checksum', '2.15.3');

    cosignPath = '/usr/local/bin/cosign';
    await goreleaser.install('goreleaser', 'v2.15.3');
    await goreleaser.install('goreleaser', 'v2.15.3');

    expect(exec).toHaveBeenCalledTimes(1);
    expect(cacheDir).toHaveBeenLastCalledWith(extractedPath, 'goreleaser-cosign', '2.15.3');
    expect(downloadTool.mock.calls.filter(([url]) => !url.includes('checksums.txt'))).toHaveLength(2);
  });

  it('reuses checksum verification for releases without sigstore bundles', async () => {
    cosignPath = '/usr/local/bin/cosign';

    await goreleaser.install('goreleaser', 'v2.12.4');
    await goreleaser.install('goreleaser', 'v2.12.4');

    expect(exec).not.toHaveBeenCalled();
    expect(cacheDir).toHaveBeenCalledTimes(1);
    expect(downloadTool.mock.calls.filter(([url]) => !url.includes('checksums.txt'))).toHaveLength(1);
  });
});
