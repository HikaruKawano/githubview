// services/github/repoService.ts
import { Octokit } from "octokit";
import { GetOwnerType } from "./orgService";

export async function GetRepos(octokit: Octokit, owner: string): Promise<string[]> {
  const ownerType = await GetOwnerType(octokit, owner);

  const endpoint = ownerType === "org" ? "GET /orgs/{org}/repos" : "GET /users/{username}/repos";
  const params = ownerType === "org" ? { org: owner } : { username: owner };

  try {
    const { data } = await octokit.request(endpoint, {
      ...params,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
      per_page: 100,
    });

    return data.map((repo: any) => repo.name);
  } catch {
    throw new Error("Erro ao buscar repositórios.");
  }
}
