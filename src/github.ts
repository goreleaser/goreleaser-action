import * as httpm from '@actions/http-client';
import * as core from '@actions/core';
import * as semver from 'semver';

export interface GitHubRelease {
  id: number;
  tag_name: string;
}

export const getRelease = async (version: string): Promise<GitHubRelease | null> => {
  const resolvedVersion: string = (await resolveVersion(version)) || version;
  const url: string = `https://github.com/goreleaser/goreleaser/releases/${resolvedVersion}`;
  const http: httpm.HttpClient = new httpm.HttpClient('goreleaser-action');
  return (await http.getJson<GitHubRelease>(url)).result;
};

const resolveVersion = async (version: string): Promise<string | null> => {
  const allTags: Array<string> | null = await getAllTags();
  if (!allTags) {
    throw new Error(`Cannot find GoReleaser tags`);
  }
  core.debug(`Found ${allTags.length} tags in total`);

  return semver.maxSatisfying(allTags, version);
};

interface GitHubTag {
  tag_name: string;
}

const getAllTags = async (): Promise<Array<string>> => {
  const http: httpm.HttpClient = new httpm.HttpClient('goreleaser-action');
  const url: string = `https://goreleaser.com/static/releases.json`;
  const getTags = http.getJson<Array<GitHubTag>>(url);

  return getTags.then(response => {
    if (response.result == null) {
      return [];
    }

    return response.result.map(obj => obj.tag_name);
  });
};
