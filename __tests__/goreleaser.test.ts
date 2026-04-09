import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { checksums } from '../src/checksums';
import * as goreleaser from '../src/goreleaser';

describe('install', () => {
  it('acquires v0.182.0 version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', 'v0.182.0');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires latest version of GoReleaser', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const bin = await goreleaser.install('goreleaser', 'latest');
    expect(fs.existsSync(bin)).toBe(true);
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('Skipping checksum verification since a specific version was not requested'));
    stdoutSpy.mockRestore();
  }, 100000);

  it('acquires v0.182.0-pro version of GoReleaser Pro', async () => {
    const bin = await goreleaser.install('goreleaser-pro', 'v0.182.0-pro');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires latest v1 version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', '~> v1');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires latest v1 version of GoReleaser Pro', async () => {
    const bin = await goreleaser.install('goreleaser-pro', '~> v1');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires latest v2 version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', '~> v2');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires latest v2 version of GoReleaser Pro', async () => {
    const bin = await goreleaser.install('goreleaser-pro', '~> v2');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires latest version of GoReleaser Pro', async () => {
    const bin = await goreleaser.install('goreleaser-pro', 'latest');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires a random version of GoReleaser', async () => {
    const versions = Object.keys(checksums).filter(v => !v.includes('pro'));
    const randomVersion = versions[Math.floor(Math.random() * versions.length)];
    console.log(`Testing random GoReleaser version: ${randomVersion}`);
    const bin = await goreleaser.install('goreleaser', randomVersion);
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);
});

describe('distribSuffix', () => {
  it('suffixes pro distribution', async () => {
    expect(goreleaser.distribSuffix('goreleaser-pro')).toEqual('-pro');
  });

  it('does not suffix oss distribution', async () => {
    expect(goreleaser.distribSuffix('goreleaser')).toEqual('');
  });
});

describe('verifyChecksum', () => {
  let testFilePath: string;
  let validChecksum: string;

  beforeAll(() => {
    testFilePath = path.join(os.tmpdir(), 'verify-checksum-test.txt');
    const fileContent = 'test content for checksum verification';
    fs.writeFileSync(testFilePath, fileContent);

    const hash = crypto.createHash('sha256');
    hash.update(fileContent);
    validChecksum = hash.digest('hex');
  });

  afterAll(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it('should resolve successfully when the checksum matches', async () => {
    await expect(goreleaser.verifyChecksum(testFilePath, validChecksum)).resolves.toBeUndefined();
  });

  it('should throw an error when the checksum does not match', async () => {
    await expect(goreleaser.verifyChecksum(testFilePath, 'invalid123checksum')).rejects.toThrow(/Checksum mismatch/);
  });
});
