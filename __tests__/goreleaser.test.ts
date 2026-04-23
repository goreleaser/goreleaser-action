import {describe, expect, it} from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as io from '@actions/io';
import * as goreleaser from '../src/goreleaser';

describe('install', () => {
  it('acquires latest version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', 'latest');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires latest v2 version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', '~> v2');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  // The following pinned versions exercise install across release eras to
  // guard against regressions in checksum handling and the cosign skip path:
  //   - v0.182.0  : pre-checksums-signing era
  //   - v1.26.2   : cosign v2 detached `.sig` only
  //   - v2.12.4   : last release before sigstore bundles (cosign skipped)
  //   - v2.13.0   : first release with cosign v3 sigstore bundle
  //   - v2.15.3   : recent release with sigstore bundle
  it('acquires v0.182.0 (pre-signing) version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', 'v0.182.0');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires v1.26.2 (cosign v2 .sig) version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', 'v1.26.2');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires v2.12.4 (last pre-sigstore-bundle) version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', 'v2.12.4');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires v2.13.0 (minimum cosign-verifiable) version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', 'v2.13.0');
    expect(fs.existsSync(bin)).toBe(true);
  }, 100000);

  it('acquires v2.15.3 (recent sigstore-bundle) version of GoReleaser', async () => {
    const bin = await goreleaser.install('goreleaser', 'v2.15.3');
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

  it('uses nightly-oss.yml@refs/heads/main for OSS nightly tag', () => {
    expect(goreleaser.getCertificateIdentity('goreleaser', 'v2.16.0-abc1234-nightly')).toEqual(
      'https://github.com/goreleaser/goreleaser/.github/workflows/nightly-oss.yml@refs/heads/main'
    );
  });

  it('uses nightly-pro.yml@refs/heads/main for Pro nightly tag', () => {
    expect(goreleaser.getCertificateIdentity('goreleaser-pro', 'v2.16.0-abc1234-nightly')).toEqual(
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

  it('installs a pre-v2.13 release (no sigstore bundle) without failing when cosign is present', async () => {
    // v2.12.x is the last release that did NOT publish checksums.txt.sigstore.json.
    // The action must still install it cleanly: checksum verified, cosign step skipped.
    await requireCosign();
    const bin = await goreleaser.install('goreleaser', 'v2.12.4');
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
