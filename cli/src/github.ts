import { readFile } from 'fs/promises';
import { join } from 'path';

const DEFAULT_REPO = 'liuww06/SkillVault';
const DEFAULT_BRANCH = 'main';

export interface GitHubConfig {
  repo: string;
  branch: string;
  local?: string; // Local path for development, bypasses GitHub
}

export function getDefaultConfig(): GitHubConfig {
  return { repo: DEFAULT_REPO, branch: DEFAULT_BRANCH };
}

export function rawUrl(config: GitHubConfig, filePath: string): string {
  return `https://raw.githubusercontent.com/${config.repo}/${config.branch}/${filePath}`;
}

export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

export async function fetchJSON<T>(url: string): Promise<T> {
  const text = await fetchText(url);
  return JSON.parse(text) as T;
}

export async function listFiles(config: GitHubConfig, dirPath: string): Promise<string[]> {
  if (config.local) {
    return listLocalFiles(config.local, dirPath);
  }
  const url = `https://api.github.com/repos/${config.repo}/contents/${dirPath}?ref=${config.branch}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`Failed to list files at ${dirPath}: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as Array<{ name: string; type: string }>;
  return data.filter((f) => f.type === 'file').map((f) => f.name);
}

async function listLocalFiles(localRoot: string, dirPath: string): Promise<string[]> {
  const { readdir, stat } = await import('fs/promises');
  const fullDir = join(localRoot, dirPath);
  try {
    const entries = await readdir(fullDir);
    const files: string[] = [];
    for (const entry of entries) {
      const s = await stat(join(fullDir, entry));
      if (s.isFile()) files.push(entry);
    }
    return files;
  } catch {
    return [];
  }
}

export async function fetchFileContent(config: GitHubConfig, filePath: string): Promise<string> {
  if (config.local) {
    return readFile(join(config.local, filePath), 'utf-8');
  }
  return fetchText(rawUrl(config, filePath));
}
