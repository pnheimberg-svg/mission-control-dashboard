import fs from "fs/promises";
import path from "path";
import { Buffer } from "buffer";

const localDataRoot = process.env.DATA_ROOT
  ? path.resolve(process.cwd(), process.env.DATA_ROOT)
  : path.resolve(process.cwd(), "data");

const defaultRepo = "pnheimberg-svg/mission-control-dashboard";
const dataRepo = process.env.DATA_REPO || process.env.GITHUB_DATA_REPO || defaultRepo;
const dataBranch = process.env.DATA_BRANCH || "main";
const githubToken = process.env.GITHUB_DATA_TOKEN || process.env.GITHUB_TOKEN;
const useGitHub = process.env.VERCEL === "1" && !!githubToken;

function resolveLocal(relPath: string) {
  return path.join(localDataRoot, relPath);
}

async function ensureLocalDir(relPath: string) {
  const dir = path.dirname(resolveLocal(relPath));
  await fs.mkdir(dir, { recursive: true });
}

function buildGitHubUrl(relPath: string) {
  const encodedPath = relPath.replace(/\\/g, "/");
  return `https://api.github.com/repos/${dataRepo}/contents/${encodedPath}?ref=${dataBranch}`;
}

async function githubFetch(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("User-Agent", "mission-control-dashboard");
  headers.set("Accept", "application/vnd.github+json");
  if (githubToken) {
    headers.set("Authorization", `Bearer ${githubToken}`);
  }
  const response = await fetch(url, { ...init, headers });
  return response;
}

async function fetchGitHubFile(relPath: string): Promise<{ content: string; sha: string }> {
  const url = buildGitHubUrl(relPath);
  const response = await githubFetch(url);
  if (response.status === 404) {
    throw Object.assign(new Error("File not found"), { status: 404 });
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub fetch failed: ${response.status} ${body}`);
  }
  const json = (await response.json()) as { content: string; sha: string };
  const buffer = Buffer.from(json.content, "base64");
  return { content: buffer.toString("utf-8"), sha: json.sha };
}

async function writeGitHubFile(relPath: string, content: string, message?: string, sha?: string) {
  if (!githubToken) {
    throw new Error("GITHUB_DATA_TOKEN is required for remote writes");
  }
  const url = buildGitHubUrl(relPath);
  const body = {
    message: message || `Update ${relPath}`,
    content: Buffer.from(content, "utf-8").toString("base64"),
    branch: dataBranch,
    committer: {
      name: "Mission Control",
      email: "mission-control@atlas"
    },
    ...(sha ? { sha } : {})
  };
  const response = await githubFetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub write failed: ${response.status} ${text}`);
  }
}

async function listGitHubDirectory(relPath: string): Promise<string[]> {
  const url = buildGitHubUrl(relPath.replace(/\\/g, "/"));
  const response = await githubFetch(url);
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub list failed: ${response.status} ${text}`);
  }
  const data = (await response.json()) as Array<{ name: string; type: string }>;
  return data.filter((item) => item.type === "file").map((item) => item.name);
}

export async function readText(relPath: string): Promise<string> {
  if (useGitHub) {
    try {
      const { content } = await fetchGitHubFile(relPath);
      return content;
    } catch (error) {
      if (typeof error === "object" && error && "status" in error && (error as any).status === 404) {
        throw new Error(`File not found: ${relPath}`);
      }
      throw error;
    }
  }
  return fs.readFile(resolveLocal(relPath), "utf-8");
}

export async function readJSON<T>(relPath: string, fallback: T): Promise<T> {
  try {
    const content = await readText(relPath);
    return JSON.parse(content) as T;
  } catch (error) {
    console.warn(`Failed to read JSON at ${relPath}`, error);
    return fallback;
  }
}

export async function writeText(relPath: string, content: string, message?: string): Promise<void> {
  if (useGitHub) {
    let sha: string | undefined;
    try {
      const meta = await fetchGitHubFile(relPath);
      sha = meta.sha;
    } catch (error) {
      if (!(typeof error === "object" && error && "status" in error && (error as any).status === 404)) {
        throw error;
      }
    }
    await writeGitHubFile(relPath, content, message, sha);
    return;
  }
  await ensureLocalDir(relPath);
  await fs.writeFile(resolveLocal(relPath), content, "utf-8");
}

export async function writeJSON(relPath: string, data: unknown, message?: string): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  await writeText(relPath, content, message);
}

export async function appendText(relPath: string, content: string, message?: string): Promise<void> {
  if (useGitHub) {
    let existing = "";
    let sha: string | undefined;
    try {
      const file = await fetchGitHubFile(relPath);
      existing = file.content;
      sha = file.sha;
    } catch (error) {
      if (!(typeof error === "object" && error && "status" in error && (error as any).status === 404)) {
        throw error;
      }
    }
    const combined = existing + content;
    await writeGitHubFile(relPath, combined, message, sha);
    return;
  }
  await ensureLocalDir(relPath);
  await fs.appendFile(resolveLocal(relPath), content, "utf-8");
}

export async function listFiles(relPath: string): Promise<string[]> {
  if (useGitHub) {
    return listGitHubDirectory(relPath);
  }
  try {
    const files = await fs.readdir(resolveLocal(relPath));
    return files;
  } catch (error) {
    console.warn(`Failed to list directory ${relPath}`, error);
    return [];
  }
}
