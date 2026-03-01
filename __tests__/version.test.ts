import {describe, expect, it, beforeEach, afterEach} from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {getRequestedVersion} from '../src/version';
import {Inputs} from '../src/context';

describe('getRequestedVersion', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goreleaser-test-'));
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    } catch (e) {
      console.error(`Failed to remove temp directory ${tmpDir}:`, e);
    }
  });

  it('returns provided version when set', () => {
    const inputs: Inputs = {
      distribution: 'goreleaser',
      version: 'v1.2.3',
      versionFile: '',
      args: '',
      workdir: '',
      installOnly: false
    };

    const v = getRequestedVersion(inputs);
    expect(v).toBe('v1.2.3');
  });

  it('parses .tool-versions and returns v-prefixed version', () => {
    const toolVersionsPath = path.join(tmpDir, '.tool-versions');
    fs.writeFileSync(toolVersionsPath, 'goreleaser 1.2.3\n');

    const inputs: Inputs = {
      distribution: 'goreleaser',
      version: '',
      versionFile: '.tool-versions',
      args: '',
      workdir: tmpDir,
      installOnly: false
    };

    const v = getRequestedVersion(inputs);
    expect(v).toBe('v1.2.3');
  });

  it('when both version and version-file are provided, version-file takes precedence', () => {
    const toolVersionsPath = path.join(tmpDir, '.tool-versions');
    fs.writeFileSync(toolVersionsPath, 'goreleaser 1.2.3\n');

    const inputs: Inputs = {
      distribution: 'goreleaser',
      version: 'v9.9.9',
      versionFile: '.tool-versions',
      args: '',
      workdir: tmpDir,
      installOnly: false
    };

    const v = getRequestedVersion(inputs);
    expect(v).toBe('v1.2.3');
  });

  it('throws when version-file does not exist', () => {
    const inputs: Inputs = {
      distribution: 'goreleaser',
      version: '',
      versionFile: 'nonexistent-file',
      args: '',
      workdir: '',
      installOnly: false
    };

    expect(() => getRequestedVersion(inputs)).toThrow();
  });

  it('throws when version-file is an unsupported type', () => {
    const toolVersionsPath = path.join(tmpDir, 'unsupported-file');
    fs.writeFileSync(toolVersionsPath, 'goreleaser 1.2.3\n');

    const inputs: Inputs = {
      distribution: 'goreleaser',
      version: '',
      versionFile: 'unsupported-file',
      args: '',
      workdir: tmpDir,
      installOnly: false
    };

    expect(() => getRequestedVersion(inputs)).toThrow();
  });
});
