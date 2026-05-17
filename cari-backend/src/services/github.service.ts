import { NotFoundError } from '../middleware/error.middleware';
import { getSupabaseAdmin } from '../lib/supabase';
import type { GitHubScrapeRequestInput } from '../schemas/github.schema';
import type { Json } from '../types/database.types';

interface GitHubUserApiResponse {
  login: string;
  name: string | null;
  bio: string | null;
  html_url: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  blog: string | null;
  company: string | null;
  created_at: string;
  updated_at: string;
}

interface GitHubRepoApiResponse {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  topics?: string[];
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface GitHubRepoSummary {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  fork: boolean;
  primaryLanguage: string | null;
  stars: number;
  forks: number;
  watchers: number;
  topics: string[];
  pushedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GitHubSnapshot {
  username: string;
  profile: {
    login: string;
    name: string | null;
    bio: string | null;
    url: string;
    avatarUrl: string;
    publicRepos: number;
    followers: number;
    following: number;
    location: string | null;
    blog: string | null;
    company: string | null;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    repoCount: number;
    sourceRepoCount: number;
    forkCount: number;
    totalStars: number;
    totalForks: number;
    recentlyActiveRepoCount: number;
  };
  languages: {
    name: string;
    repoCount: number;
  }[];
  topics: {
    name: string;
    repoCount: number;
  }[];
  topRepositories: GitHubRepoSummary[];
  fetchedAt: string;
}

interface SavedGitHubSnapshot {
  id: string;
  snapshot: GitHubSnapshot;
  fetchedAt: string;
}

async function scrapeGitHubProfile(
  userId: string,
  input: GitHubScrapeRequestInput
): Promise<SavedGitHubSnapshot> {
  const [profile, repos] = await Promise.all([
    fetchGitHub<GitHubUserApiResponse>(
      `https://api.github.com/users/${input.username}`
    ),
    fetchGitHub<GitHubRepoApiResponse[]>(
      `https://api.github.com/users/${input.username}/repos?per_page=${input.maxRepos}&sort=updated&type=owner`
    ),
  ]);

  const filteredRepos = input.includeForks
    ? repos
    : repos.filter((repo) => !repo.fork);

  const snapshot = buildSnapshot(input.username, profile, filteredRepos, repos);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('github_snapshots')
    .insert({
      user_id: userId,
      github_username: input.username,
      data: toJson(snapshot),
    })
    .select('id,data,fetched_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    snapshot: data.data as unknown as GitHubSnapshot,
    fetchedAt: data.fetched_at,
  };
}

async function fetchGitHub<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'cari-backend',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (response.status === 404) {
    throw new NotFoundError('GitHub user not found');
  }

  if (!response.ok) {
    throw new Error(`GitHub API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function buildSnapshot(
  username: string,
  profile: GitHubUserApiResponse,
  repos: GitHubRepoApiResponse[],
  allRepos: GitHubRepoApiResponse[]
): GitHubSnapshot {
  const fetchedAt = new Date().toISOString();
  const languageCounts = countBy(
    repos
      .map((repo) => repo.language)
      .filter((language): language is string => Boolean(language))
  );
  const topicCounts = countBy(repos.flatMap((repo) => repo.topics ?? []));
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const repoSummaries = repos.map(mapRepo);

  return {
    username,
    profile: {
      login: profile.login,
      name: profile.name,
      bio: profile.bio,
      url: profile.html_url,
      avatarUrl: profile.avatar_url,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      location: profile.location,
      blog: profile.blog,
      company: profile.company,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
    stats: {
      repoCount: allRepos.length,
      sourceRepoCount: allRepos.filter((repo) => !repo.fork).length,
      forkCount: allRepos.filter((repo) => repo.fork).length,
      totalStars: repos.reduce((total, repo) => total + repo.stargazers_count, 0),
      totalForks: repos.reduce((total, repo) => total + repo.forks_count, 0),
      recentlyActiveRepoCount: repos.filter((repo) => {
        if (!repo.pushed_at) return false;
        return new Date(repo.pushed_at).getTime() >= thirtyDaysAgo;
      }).length,
    },
    languages: mapCounts(languageCounts),
    topics: mapCounts(topicCounts),
    topRepositories: repoSummaries
      .sort((a, b) => b.stars - a.stars || b.forks - a.forks)
      .slice(0, 10),
    fetchedAt,
  };
}

function mapRepo(repo: GitHubRepoApiResponse): GitHubRepoSummary {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    fork: repo.fork,
    primaryLanguage: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.watchers_count,
    topics: repo.topics ?? [],
    pushedAt: repo.pushed_at,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
  };
}

function countBy(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

function mapCounts(counts: Map<string, number>): { name: string; repoCount: number }[] {
  return [...counts.entries()]
    .map(([name, repoCount]) => ({ name, repoCount }))
    .sort((a, b) => b.repoCount - a.repoCount || a.name.localeCompare(b.name));
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export { scrapeGitHubProfile };
export type { GitHubSnapshot, SavedGitHubSnapshot };
