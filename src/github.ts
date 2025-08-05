import * as goreleaser from './goreleaser';
import * as semver from 'semver';
import * as core from '@actions/core';
import * as httpm from '@actions/http-client';

const maxRetries = 10;
const timeoutMs = 1000;
const withRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      core.debug(`Attempt ${attempt + 1} failed, retrying in ${timeoutMs}: ${lastError.message}`);
      await new Promise(resolve => setTimeout(resolve, timeoutMs));
    }
  }

  throw lastError;
};

export interface GitHubRelease {
  tag_name: string;
}

export const getRelease = async (distribution: string, version: string): Promise<GitHubRelease> => {
  if (version === 'latest') {
    core.warning("You are using 'latest' as default version. Will lock to '~> v2'.");
    return getReleaseTag(distribution, '~> v2');
  }
  return getReleaseTag(distribution, version);
};

export const getReleaseTag = async (distribution: string, version: string): Promise<GitHubRelease> => {
  if (version === 'nightly') {
    return {tag_name: version};
  }

  // If version is a specific version (not a range), skip the JSON check
  const cleanVersion: string = cleanTag(version);
  if (semver.valid(cleanVersion)) {
    let tag = version.startsWith('v') ? version : `v${version}`;

    // Handle GoReleaser Pro suffix for versions < 2.7.0, but only if not already present
    // TODO: remove all this `-pro` thing at some point.
    if (goreleaser.isPro(distribution) && semver.lt(cleanVersion, '2.7.0') && !tag.endsWith('-pro')) {
      tag = tag + goreleaser.distribSuffix(distribution);
    }

    return {tag_name: tag};
  }

  const tag: string = (await resolveVersion(distribution, version)) || version;
  const suffix: string = goreleaser.distribSuffix(distribution);
  const url = `https://goreleaser.com/static/releases${suffix}.json`;

  const releases = await withRetry(async () => {
    const http: httpm.HttpClient = new httpm.HttpClient('goreleaser-action');
    const resp: httpm.HttpClientResponse = await http.get(url);
    const body = await resp.readBody();
    const statusCode = resp.message.statusCode || 500;
    if (statusCode >= 400) {
      throw new Error(
        `Failed to get GoReleaser release ${version} from ${url} with status code ${statusCode}: ${body}`
      );
    }
    return <Array<GitHubRelease>>JSON.parse(body);
  });

  const res = releases.filter(r => r.tag_name === tag).shift();
  if (res) {
    return res;
  }
  throw new Error(`Cannot find GoReleaser release ${version} in ${url}`);
};

const resolveVersion = async (distribution: string, version: string): Promise<string | null> => {
  const allTags: Array<string> | null = await getAllTags(distribution);
  if (!allTags) {
    throw new Error(`Cannot download ${distribution} tags`);
  }
  core.debug(`Found ${allTags.length} tags in total`);

  const cleanTags: Array<string> = allTags.map(tag => cleanTag(tag));
  const cleanVersion: string = cleanTag(version);
  if (!semver.valid(cleanVersion) && !semver.validRange(cleanVersion)) {
    // if the given version is invalid, return whatever we got.
    return version;
  }
  const v = semver.maxSatisfying(cleanTags, cleanVersion);
  if (semver.lt(v, '2.7.0')) {
    // if its a version older than 2.7.0, append the suffix.
    return v + goreleaser.distribSuffix(distribution);
  }
  return v;
};

interface GitHubTag {
  tag_name: string;
}

const getAllTags = async (distribution: string): Promise<Array<string>> => {
  const suffix: string = goreleaser.distribSuffix(distribution);
  const url = `https://goreleaser.com/static/releases${suffix}.json`;
  core.debug(`Downloading ${url}`);

  return withRetry(async () => {
    const http: httpm.HttpClient = new httpm.HttpClient('goreleaser-action');
    const response = await http.getJson<Array<GitHubTag>>(url);
    if (response.result == null) {
      return [];
    }
    return response.result.map(obj => obj.tag_name);
  });
};

const cleanTag = (tag: string): string => {
  return tag.replace(/-pro$/, '');
};
