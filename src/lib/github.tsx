import { Octokit } from "octokit";
import Swal from "sweetalert2";

const createOctokit = (token: string) => new Octokit({ auth: token });

async function isOrganization(octokit: Octokit, owner: string): Promise<boolean> {
  try {
    const { data } = await octokit.request("GET /orgs/{org}", { org: owner });
    return !!data;
  } catch {
    return false;
  }
}

export async function GetRepos(owner: string, token: string): Promise<string[]> {
  const octokit = createOctokit(token);

  try {
    const isOrg = await isOrganization(octokit, owner);
    const endpoint = isOrg ? "GET /orgs/{org}/repos" : "GET /users/{username}/repos";
    const params = isOrg ? { org: owner } : { username: owner };

    const { data } = await octokit.request(endpoint, {
      ...params,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
      per_page: 100,
    });

    return data.map((repo: any) => repo.name);
  } catch (error) {
    Swal.fire("Erro", "Erro ao buscar repositórios.", "error");
    return [];
  }
}

async function GetReviewCommentsCount(octokit: Octokit, owner: string, repo: string, pull_number: number): Promise<number> {
  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/comments", {
      owner,
      repo,
      pull_number,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
      per_page: 100,
    });

    return data.length;
  } catch (error) {
    console.error(`Erro ao buscar comentários do PR #${pull_number} em ${repo}:`, error);
    return 0;
  }
}

export async function FetchOpenPullRequests(owner: string, repo: string, token: string) {
  const octokit = createOctokit(token);

  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
      owner,
      repo,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
      per_page: 100,
      state: "open",
    });

    if (!data.length) return null;

    const prsWithComments = await Promise.all(
      data.map(async (pr: any) => {
        const reviewCommentsCount = await GetReviewCommentsCount(octokit, owner, repo, pr.number);

        return {
          title: pr.title,
          url: pr.user?.avatar_url,
          state: pr.state,
          owner: pr.user?.login,
          prUrl: pr.html_url,
          comments: reviewCommentsCount,
        };
      })
    );

    return { repo, prs: prsWithComments };
  } catch (error) {
    Swal.fire("Erro", `Erro ao buscar PRs do repositório ${repo}.`, "error");
    return null;
  }
}

export async function FetchOpenPullRequestsByRepo(owner: string, token: string) {
  const repos = await GetRepos(owner, token);
  if (!repos.length) return [];

  const results = await Promise.all(repos.map(repo => FetchOpenPullRequests(owner, repo, token)));

  return results.filter(Boolean);
}
