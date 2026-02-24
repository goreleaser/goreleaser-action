import * as core from '@actions/core';
import * as fs from 'fs';
import path from 'path';
import {Inputs} from './context';

export function getRequestedVersion(inputs: Inputs): string {
  let requestedVersion = inputs.version;
  let versionFilePath = inputs.versionFile;

  if (requestedVersion && versionFilePath) {
    core.warning(
      `Both version (${requestedVersion}) and version-file (${versionFilePath}) inputs are specified, only version will be used`
    );
  }

  if (requestedVersion == '' && versionFilePath) {
    const workingDirectory = inputs.workdir;
    if (workingDirectory) {
      versionFilePath = path.join(workingDirectory, versionFilePath);
    }

    if (!fs.existsSync(versionFilePath)) {
      throw new Error(`The specified GoReleaser version file at: ${versionFilePath} does not exist`);
    }

    const content = fs.readFileSync(versionFilePath, 'utf-8');

    if (path.basename(versionFilePath) === '.tool-versions') {
      // asdf/mise file.
      const match = content.match(/^goreleaser\s+([^\n#]+)/m);
      requestedVersion = match ? 'v' + match[1].trim().replace(/^v/gi, '') : '';
    }
  }

  if (!requestedVersion) {
    // default to latest v2 release
    requestedVersion = '~> v2';
  }

  return requestedVersion;
}
