import * as fs from 'fs';
import * as path from 'path';
import {Inputs} from './context';

// Resolves the GoReleaser version to install.
//
// When `version-file` is set, it is read from disk and parsed; the resolved
// value takes precedence over the `version` input. Otherwise, `version` is
// returned as-is (it always has a default — see context.getInputs).
export function getRequestedVersion(inputs: Inputs): string {
  if (!inputs.versionFile) {
    return inputs.version;
  }

  const filePath = path.isAbsolute(inputs.versionFile)
    ? inputs.versionFile
    : path.join(inputs.workdir || '.', inputs.versionFile);

  if (!fs.existsSync(filePath)) {
    throw new Error(`version-file not found: ${filePath}`);
  }

  const basename = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  switch (basename) {
    case '.tool-versions':
      return parseToolVersions(content, filePath);
    default:
      throw new Error(`Unsupported version-file: ${filePath} (only .tool-versions is supported)`);
  }
}

// Parses a single `goreleaser <version>` entry out of a `.tool-versions` file
// (asdf/mise format). Full-line `#` comments and inline `# ...` suffixes are
// stripped. When a tool lists multiple fallback versions only the first is
// used. Bare semvers are returned with a leading `v`; constraint expressions
// (`~> v2`, `latest`, ...) are returned as-is.
function parseToolVersions(content: string, filePath: string): string {
  for (const rawLine of content.split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) {
      continue;
    }
    const tokens = line.split(/\s+/);
    if (tokens[0] !== 'goreleaser') {
      continue;
    }
    const version = tokens[1];
    if (!version) {
      throw new Error(`No version specified for goreleaser in ${filePath}`);
    }
    return /^\d/.test(version) ? `v${version}` : version;
  }
  throw new Error(`No goreleaser entry found in ${filePath}`);
}
