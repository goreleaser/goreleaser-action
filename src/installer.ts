import * as tc from '@actions/tool-cache';
import * as download from 'download';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as restm from 'typed-rest-client/RestClient';

let osPlat: string = os.platform();
let osArch: string = os.arch();

export async function getGoReleaser(version: string): Promise<string> {
  const selected = await determineVersion(version);
  if (selected) {
    version = selected;
  }

  console.log(`✅ GoReleaser version found: ${version}`);
  const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'goreleaser-'));
  const fileName = getFileName();
  const downloadUrl = util.format(
    'https://github.com/goreleaser/goreleaser/releases/download/%s/%s',
    version,
    fileName
  );

  console.log(`⬇️ Downloading ${downloadUrl}...`);
  await download.default(downloadUrl, tmpdir, {filename: fileName});

  console.log('📦 Extracting GoReleaser...');
  let extPath: string = tmpdir;
  if (osPlat == 'win32') {
    extPath = await tc.extractZip(`${tmpdir}/${fileName}`);
  } else {
    extPath = await tc.extractTar(`${tmpdir}/${fileName}`);
  }

  return path.join(
    extPath,
    osPlat == 'win32' ? 'goreleaser.exe' : 'goreleaser'
  );
}

function getFileName(): string {
  const platform: string =
    osPlat == 'win32' ? 'Windows' : osPlat == 'darwin' ? 'Darwin' : 'Linux';
  const arch: string = osArch == 'x64' ? 'x86_64' : 'i386';
  const ext: string = osPlat == 'win32' ? 'zip' : 'tar.gz';
  const filename: string = util.format(
    'goreleaser_%s_%s.%s',
    platform,
    arch,
    ext
  );
  return filename;
}

interface GitHubRelease {
  tag_name: string;
}

async function determineVersion(version: string): Promise<string> {
  let rest: restm.RestClient = new restm.RestClient(
    'goreleaser-action',
    'https://github.com',
    undefined,
    {
      headers: {
        Accept: 'application/json'
      }
    }
  );

  let res: restm.IRestResponse<GitHubRelease> = await rest.get<GitHubRelease>(
    `/goreleaser/goreleaser/releases/${version}`
  );
  if (res.statusCode != 200 || res.result === null) {
    throw new Error(
      `Cannot find GoReleaser ${version} release (http ${res.statusCode})`
    );
  }

  return res.result.tag_name;
}
