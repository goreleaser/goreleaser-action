import * as goreleaser from './goreleaser';
import * as semver from 'semver';
import * as core from '@actions/core';
import * as httpm from '@actions/http-client';

export interface GitHubRelease {
  tag_name: string;
}

export const getRelease = async (distribution: string, version: string): Promise<GitHubRelease> => {
  if (version === 'latest') {
    return getLatestRelease(distribution);
  }
  return getReleaseTag(distribution, version);
};

export const getReleaseTag = async (distribution: string, version: string): Promise<GitHubRelease> => {
  const tag: string = (await resolveVersion(distribution, version)) || version;
  const suffix: string = goreleaser.distribSuffix(distribution);
  const url = `https://goreleaser.com/static/releases${suffix}.json`;
  const http: httpm.HttpClient = new httpm.HttpClient('goreleaser-action');
  const resp: httpm.HttpClientResponse = await http.get(url);
  const body = await resp.readBody();
  const statusCode = resp.message.statusCode || 500;
  if (statusCode >= 400) {
    throw new Error(
      `Failed to get GoReleaser release ${version}${suffix} from ${url} with status code ${statusCode}: ${body}`
    );
  }
  const releases = <Array<GitHubRelease>>JSON.parse(body);
  const res = releases.filter(r => r.tag_name === tag).shift();
  if (res) {
    return res;
  }
  throw new Error(`Cannot find GoReleaser release ${version}${suffix} in ${url}`);
};

export const getLatestRelease = async (distribution: string): Promise<GitHubRelease> => {
  const suffix: string = goreleaser.distribSuffix(distribution);
  const url = `https://goreleaser.com/static/latest${suffix}`;
  const http: httpm.HttpClient = new httpm.HttpClient('goreleaser-action');
  const resp: httpm.HttpClientResponse = await http.get(url);
  const body = await resp.readBody();
  const statusCode = resp.message.statusCode || 500;
  if (statusCode >= 400) {
    throw new Error(`Failed to get GoReleaser release latest from ${url} with status code ${statusCode}: ${body}`);
  }
  return {tag_name: body};
};

const resolveVersion = async (distribution: string, version: string): Promise<string | null> => {
  const allTags: Array<string> | null = await getAllTags(distribution);
  if (!allTags) {
    throw new Error(`Cannot download ${distribution} tags`);
  }
  core.debug(`Found ${allTags.length} tags in total`);

  const cleanTags: Array<string> = allTags.map(tag => cleanTag(tag));
  const cleanVersion: string = cleanTag(version);
  return semver.maxSatisfying(cleanTags, cleanVersion) + goreleaser.distribSuffix(distribution);
};

interface GitHubTag {
  tag_name: string;
}

const getAllTags = async (distribution: string): Promise<Array<string>> => {
  const http: httpm.HttpClient = new httpm.HttpClient('goreleaser-action');
  const suffix: string = goreleaser.distribSuffix(distribution);
  const url = `https://goreleaser.com/static/releases${suffix}.json`;
  core.debug(`Downloading ${url}`);
  const getTags = http.getJson<Array<GitHubTag>>(url);
  return getTags.then(response => {
    if (response.result == null) {
      return [];
    }
    return response.result.map(obj => obj.tag_name);
  });
};

const cleanTag = (tag: string): string => {
  return tag.replace(/-pro$/, '');
};
