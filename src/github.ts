import * as goreleaser from './goreleaser';
import * as semver from 'semver';
import * as core from '@actions/core';
import * as httpm from '@actions/http-client';
import * as github from '@actions/github';

export interface Release {
  id: number;
  tag_name: string;
}

const owner = 'goreleaser';

export const getRelease = async (
  distribution: string,
  version: string,
  githubToken: string
): Promise<Release | null> => {
  if (version === 'latest') {
    return getLatestRelease(distribution, githubToken);
  }
  const tag: string = (await resolveVersion(distribution, version)) || version;
  return getReleaseTag(distribution, tag, githubToken);
};

export const getReleaseTag = async (repo: string, tag: string, githubToken: string): Promise<Release> => {
  core.info(`Getting tag ${resolveVersion}...`);
  return (
    await github
      .getOctokit(githubToken, {
        baseUrl: 'https://api.github.com'
      })
      .rest.repos.getReleaseByTag({
        owner,
        repo,
        tag
      })
      .catch(error => {
        throw new Error(`Cannot get ${repo} release ${tag}: ${error}`);
      })
  ).data as Release;
};

export const getLatestRelease = async (repo: string, githubToken: string): Promise<Release> => {
  core.info(`Getting tag latest...`);
  return (
    await github
      .getOctokit(githubToken)
      .rest.repos.getLatestRelease({
        owner,
        repo
      })
      .catch(error => {
        throw new Error(`Cannot get latest release: ${error}`);
      })
  ).data as Release;
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
  core.info(`Downloading ${url}`);
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
