import {describe, expect, it, beforeEach, afterEach} from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {getRequestedVersion} from '../src/version';
import {Inputs} from '../src/context';

const baseInputs = (overrides: Partial<Inputs>): Inputs => ({
  distribution: 'goreleaser',
  version: '~> v2',
  versionFile: '',
  args: '',
  workdir: '.',
  installOnly: false,
  ...overrides
});

describe('getRequestedVersion', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goreleaser-version-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  const writeToolVersions = (content: string, name = '.tool-versions'): void => {
    fs.writeFileSync(path.join(tmpDir, name), content);
  };

  describe('without version-file', () => {
    it('returns the version input as-is', () => {
      expect(getRequestedVersion(baseInputs({version: 'v1.2.3'}))).toBe('v1.2.3');
    });

    it('returns the default version when none is provided', () => {
      expect(getRequestedVersion(baseInputs({version: '~> v2'}))).toBe('~> v2');
    });
  });

  describe('with .tool-versions', () => {
    it('parses an unprefixed version and adds the v prefix', () => {
      writeToolVersions('goreleaser 1.2.3\n');
      expect(getRequestedVersion(baseInputs({versionFile: '.tool-versions', workdir: tmpDir}))).toBe('v1.2.3');
    });

    it('keeps an existing v prefix without doubling it', () => {
      writeToolVersions('goreleaser v1.2.3\n');
      expect(getRequestedVersion(baseInputs({versionFile: '.tool-versions', workdir: tmpDir}))).toBe('v1.2.3');
    });

    it('takes precedence over the version input', () => {
      writeToolVersions('goreleaser 1.2.3\n');
      expect(getRequestedVersion(baseInputs({version: 'v9.9.9', versionFile: '.tool-versions', workdir: tmpDir}))).toBe(
        'v1.2.3'
      );
    });

    it('ignores other tools and picks goreleaser', () => {
      writeToolVersions(['nodejs 20.10.0', 'goreleaser 2.13.0', 'python 3.12.1', ''].join('\n'));
      expect(getRequestedVersion(baseInputs({versionFile: '.tool-versions', workdir: tmpDir}))).toBe('v2.13.0');
    });

    it('skips full-line and inline comments', () => {
      writeToolVersions(['# pinned for CI', 'goreleaser 2.13.0 # minimum cosign-verifiable', ''].join('\n'));
      expect(getRequestedVersion(baseInputs({versionFile: '.tool-versions', workdir: tmpDir}))).toBe('v2.13.0');
    });

    it('preserves "latest"', () => {
      writeToolVersions('goreleaser latest\n');
      expect(getRequestedVersion(baseInputs({versionFile: '.tool-versions', workdir: tmpDir}))).toBe('latest');
    });

    it('uses only the first version when multiple fallbacks are listed', () => {
      // asdf supports listing fallback versions; we install the first match.
      writeToolVersions('goreleaser 2.13.0 2.12.4\n');
      expect(getRequestedVersion(baseInputs({versionFile: '.tool-versions', workdir: tmpDir}))).toBe('v2.13.0');
    });

    it('accepts an absolute path and ignores workdir', () => {
      const abs = path.join(tmpDir, '.tool-versions');
      fs.writeFileSync(abs, 'goreleaser 2.13.0\n');
      expect(getRequestedVersion(baseInputs({versionFile: abs, workdir: '/nonexistent'}))).toBe('v2.13.0');
    });

    it('throws when the file does not exist', () => {
      expect(() => getRequestedVersion(baseInputs({versionFile: '.tool-versions', workdir: tmpDir}))).toThrow(
        /version-file not found/
      );
    });

    it('throws when the file has no goreleaser entry', () => {
      writeToolVersions(['nodejs 20.10.0', 'python 3.12.1', ''].join('\n'));
      expect(() => getRequestedVersion(baseInputs({versionFile: '.tool-versions', workdir: tmpDir}))).toThrow(
        /No goreleaser entry/
      );
    });

    it('throws when the goreleaser entry has no version', () => {
      writeToolVersions('goreleaser\n');
      expect(() => getRequestedVersion(baseInputs({versionFile: '.tool-versions', workdir: tmpDir}))).toThrow(
        /No version specified for goreleaser/
      );
    });
  });

  describe('with an unsupported file', () => {
    it('throws a clear error', () => {
      fs.writeFileSync(path.join(tmpDir, '.go-version'), '1.2.3\n');
      expect(() => getRequestedVersion(baseInputs({versionFile: '.go-version', workdir: tmpDir}))).toThrow(
        /Unsupported version-file/
      );
    });
  });
});
