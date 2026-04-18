import {describe, expect, it} from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as io from '@actions/io';
import * as goreleaser from '../src/goreleaser';

describe('install', () => {
  it('acquires v0.182.0 version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', 'v0.182.0');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires latest version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', 'latest');
    expect(fs.existsSync(bin)).toBe(true);
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
});

describe('distribSuffix', () => {
  it('suffixes pro distribution', async () => {
    expect(goreleaser.distribSuffix('goreleaser-pro')).toEqual('-pro');
  });

  it('does not suffix oss distribution', async () => {
    expect(goreleaser.distribSuffix('goreleaser')).toEqual('');
  });
});

describe('findChecksum', () => {
  const sample = [
    '*malformed-line',
    '',
    'abc123  goreleaser_Linux_x86_64.tar.gz',
    'def456 *goreleaser_Darwin_all.tar.gz',
    '789xyz  checksums.txt'
  ].join('\n');

  it('finds a checksum by filename', () => {
    expect(goreleaser.findChecksum(sample, 'goreleaser_Linux_x86_64.tar.gz')).toEqual('abc123');
  });

  it('strips a leading asterisk on the filename (binary mode)', () => {
    expect(goreleaser.findChecksum(sample, 'goreleaser_Darwin_all.tar.gz')).toEqual('def456');
  });

  it('returns undefined when not present', () => {
    expect(goreleaser.findChecksum(sample, 'missing.tar.gz')).toBeUndefined();
  });
});

describe('getCertificateIdentity', () => {
  it('returns the OSS workflow identity for tagged releases', () => {
    expect(goreleaser.getCertificateIdentity('goreleaser', 'v2.15.3')).toEqual(
      'https://github.com/goreleaser/goreleaser/.github/workflows/release.yml@refs/tags/v2.15.3'
    );
  });

  it('returns the Pro internal workflow identity for tagged releases', () => {
    expect(goreleaser.getCertificateIdentity('goreleaser-pro', 'v2.15.3')).toEqual(
      'https://github.com/goreleaser/goreleaser-pro-internal/.github/workflows/release-pro.yml@refs/tags/v2.15.3'
    );
  });

  it('uses nightly-oss.yml@refs/heads/main for OSS nightly', () => {
    expect(goreleaser.getCertificateIdentity('goreleaser', 'nightly')).toEqual(
      'https://github.com/goreleaser/goreleaser/.github/workflows/nightly-oss.yml@refs/heads/main'
    );
  });

  it('uses nightly-pro.yml@refs/heads/main for Pro nightly', () => {
    expect(goreleaser.getCertificateIdentity('goreleaser-pro', 'nightly')).toEqual(
      'https://github.com/goreleaser/goreleaser-pro-internal/.github/workflows/nightly-pro.yml@refs/heads/main'
    );
  });
});

describe('verifyChecksum', () => {
  const requireCosign = async (): Promise<void> => {
    const cosign = await io.which('cosign', false);
    if (!cosign) {
      throw new Error(
        'cosign must be installed in PATH to run this integration test (apk add cosign / sigstore/cosign-installer)'
      );
    }
  };

  it('verifies a tagged OSS release end-to-end with cosign', async () => {
    await requireCosign();
    const bin = await goreleaser.install('goreleaser', 'v2.15.3');
    expect(fs.existsSync(bin)).toBe(true);
  }, 120000);

  it('verifies the OSS nightly release end-to-end with cosign', async () => {
    await requireCosign();
    const bin = await goreleaser.install('goreleaser', 'nightly');
    expect(fs.existsSync(bin)).toBe(true);
  }, 120000);

  it('throws on checksum mismatch', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gha-'));
    const archive = path.join(dir, 'fake.tar.gz');
    fs.writeFileSync(archive, 'tampered content');
    await expect(
      goreleaser.verifyChecksum('goreleaser', 'v2.15.3', archive, 'goreleaser_Linux_x86_64.tar.gz')
    ).rejects.toThrow(/Checksum mismatch/);
  }, 60000);

  it('throws when the filename is not in checksums.txt', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gha-'));
    const archive = path.join(dir, 'whatever.tar.gz');
    fs.writeFileSync(archive, '');
    await expect(
      goreleaser.verifyChecksum('goreleaser', 'v2.15.3', archive, 'not-a-real-asset.tar.gz')
    ).rejects.toThrow(/Could not find not-a-real-asset.tar.gz in checksums.txt/);
  }, 60000);
});
