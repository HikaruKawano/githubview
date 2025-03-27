import { Octokit } from "octokit";
import Swal from "sweetalert2";

const createOctokit = (token: string) => new Octokit({ auth: token });

// Valida se o owner é uma organização ou um usuário
async function isOrganizationOrUser(
  octokit: Octokit,
  owner: string
): Promise<"org" | "user" | null> {
  try {
    await octokit.request("GET /orgs/{org}", { org: owner });
    return "org";
  } catch {
    try {
      await octokit.request("GET /users/{username}", { username: owner });
      return "user";
    } catch {
      throw new Error("Usuário ou organização não encontrados.");
    }
  }
}

export async function GetRepos(owner: string, token: string): Promise<string[]> {
  const octokit = createOctokit(token);

  try {
    const type = await isOrganizationOrUser(octokit, owner);
    if (!type) {
      Swal.fire("Erro", "Usuário ou organização não encontrados.", "error");
      return [];
    }

    const endpoint = type === "org" ? "GET /orgs/{org}/repos" : "GET /users/{username}/repos";
    const params = type === "org" ? { org: owner } : { username: owner };

    const { data } = await octokit.request(endpoint, {
      ...params,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
      per_page: 100,
    });

    return data.map((repo: any) => repo.name);
  } catch (error) {
    throw new Error("Erro ao buscar repositórios.");
  }
}

async function GetReviewCommentsCount(
  octokit: Octokit,
  owner: string,
  repo: string,
  pull_number: number
): Promise<number> {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      {
        owner,
        repo,
        pull_number,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
        per_page: 100,
      }
    );

    return data.length;
  } catch (error) {
    throw new Error(`Erro ao buscar comentários do PR.`);
  }
}

async function IsPullRequestApproved(
  octokit: Octokit,
  owner: string,
  repo: string,
  pull_number: number
): Promise<boolean> {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
      {
        owner,
        repo,
        pull_number,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      }
    );

    return data.some((review) => review.state === "APPROVED");
  } catch (error) {
    throw new Error(`Erro ao buscar revisões do PR.`);
  }
}

async function GetResolvedReviewThreads(
  octokit: Octokit,
  owner: string,
  repo: string,
  pull_number: number
): Promise<number> {
  const query = `
    query($owner: String!, $repo: String!, $pull_number: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $pull_number) {
          reviewThreads(first: 100) {
            nodes {
              isResolved
            }
          }
        }
      }
    }
  `;
  
  // A conversão para number é necessária pois o GraphQL espera um Int para pull_number
  const variables = { owner, repo, pull_number };

  const response = await octokit.graphql(query, variables) as {
    repository: {
      pullRequest: {
        reviewThreads: { nodes: { isResolved: boolean }[] }
      }
    }
  };

  const threads = response.repository.pullRequest.reviewThreads.nodes;
  const resolvedCount = threads.filter(thread => thread.isResolved).length;
  console.log("aaaaaaaaa", resolvedCount)
  return resolvedCount;
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
      data.map(async (pr) => {
        const reviewCommentsCount = await GetReviewCommentsCount(octokit, owner, repo, pr.number);
        const resolvedConversations = await GetResolvedReviewThreads(octokit, owner, repo, pr.number);
        const isApproved = await IsPullRequestApproved(octokit, owner, repo, pr.number);

        const createdAt = new Date(pr.created_at);
        const now = new Date();
        const daysOpen = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        return {
          title: pr.title,
          url: pr.user?.avatar_url,
          state: pr.state,
          owner: pr.user?.login,
          prUrl: pr.html_url,
          approved: isApproved,
          comments: reviewCommentsCount,
          resolvedComments: resolvedConversations,
          createdAt: pr.created_at,
          daysOpen,
        };
      })
    );

    return { repo, prs: prsWithComments };
  } catch (error) {
    throw new Error(`Erro ao buscar PRs do repositório.`);
  }
}

export async function FetchOpenPullRequestsByRepo(owner: string, token: string) {
  const repos = await GetRepos(owner, token);
  if (!repos.length) return [];

  const results = await Promise.all(repos.map((repo) => FetchOpenPullRequests(owner, repo, token)));

  return results.filter(Boolean);
}

export async function GetUserData(owner: string, token: string) {
  const octokit = createOctokit(token);

  try {
    const { data } = await octokit.request("GET /users/{username}", {
      username: owner,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });

    return {
      login: data.login,
      name: data.name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      company: data.company,
      email: data.email,
      location: data.location,
      blog: data.blog,
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following,
      created_at: data.created_at,
    };
  } catch (error) {
    throw new Error("Erro ao buscar dados do usuário.");
  }
}
