import * as httpm from '@actions/http-client';
import * as core from '@actions/core';
import * as semver from 'semver';

export interface GitHubRelease {
  id: number;
  tag_name: string;
}

export const getRelease = async (distribution: string, version: string): Promise<GitHubRelease | null> => {
  const resolvedVersion: string = (await resolveVersion(distribution, version)) || version;
  const url: string = `https://github.com/goreleaser/${distribution}/releases/${resolvedVersion}`;
  const http: httpm.HttpClient = new httpm.HttpClient('goreleaser-action');
  return (await http.getJson<GitHubRelease>(url)).result;
};

const resolveVersion = async (distribution: string, version: string): Promise<string | null> => {
  const allTags: Array<string> | null = await getAllTags(distribution);
  if (!allTags) {
    throw new Error(`Cannot find GoReleaser tags`);
  }
  core.debug(`Found ${allTags.length} tags in total`);

  if (version === 'latest' || !isPro(distribution)) {
    return semver.maxSatisfying(allTags, version);
  }

  const cleanTags: Array<string> = allTags.map(tag => cleanTag(tag));
  const cleanVersion: string = cleanTag(version);
  return semver.maxSatisfying(cleanTags, cleanVersion) + suffix(distribution);
};

interface GitHubTag {
  tag_name: string;
}

const getAllTags = async (distribution: string): Promise<Array<string>> => {
  const http: httpm.HttpClient = new httpm.HttpClient('goreleaser-action');
  const pro: string = suffix(distribution);
  const url: string = `https://goreleaser.com/static/releases${pro}.json`;
  const getTags = http.getJson<Array<GitHubTag>>(url);

  return getTags.then(response => {
    if (response.result == null) {
      return [];
    }

    return response.result.map(obj => obj.tag_name);
  });
};

export const suffix = (distribution: string): string => {
  return isPro(distribution) ? '-pro' : '';
};

const isPro = (distribution: string): boolean => {
  return distribution === 'goreleaser-pro';
};

const cleanTag = (tag: string): string => {
  return tag.replace(/-pro$/, '');
};
