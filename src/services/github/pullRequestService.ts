// services/github/pullRequestService.ts
import { Octokit } from "octokit";
import { GetRepos } from "./repoService";

async function GetReviewCommentsCount(octokit: Octokit, url: string, pullNumber?: number) {
  try {
    const endpoint = pullNumber === undefined
      ? `${url}/comments`
      : `${url}/${pullNumber}/comments`;

    const { data } = await octokit.request(`GET ${endpoint}`, {
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
      per_page: 100,
    });

    return data.length;
  } catch {
    throw new Error("Erro ao buscar comentários do PR.");
  }
}

async function IsPullRequestApproved(octokit: Octokit, url: string, pullNumber?: number) {
  const endpoint = pullNumber === undefined
  ? `${url}/comments`
  : `${url}/${pullNumber}/reviews`;
  try {
    const { data } = await octokit.request(`GET ${endpoint}`, {
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });

    return data.some((review: any) => review.state === "APPROVED");
  } catch {
    throw new Error("Erro ao buscar revisões do PR.");
  }
}

async function GetResolvedReviewThreads(octokit: Octokit, repo: { name: string; pulls_url: string }, pullNumber: number) {
  let owner = repo.pulls_url.match(/(?<=https:\/\/api\.github\.com\/repos\/)[^\/]+/);
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

  const variables = { owner: owner![0], repo: repo.name, pull_number: pullNumber };

  const response = await octokit.graphql(query, variables) as {
    repository: {
      pullRequest: {
        reviewThreads: { nodes: { isResolved: boolean }[] }
      }
    }
  };

  const resolvedThreads = response.repository.pullRequest.reviewThreads.nodes;
  return resolvedThreads.filter((thread) => thread.isResolved).length;
}

export async function FetchSinglePullRequest(
  octokit: Octokit,
  repo: { name: string; pulls_url: string },
  prNumber: number,
) {
  try {
    const { data } = await octokit.request(`GET ${repo.pulls_url}`, {
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });

    const [comments, resolvedComments, approved] = await Promise.all([
      await GetReviewCommentsCount(octokit, repo.pulls_url),
      await GetResolvedReviewThreads(octokit, repo, prNumber),
      await IsPullRequestApproved(octokit, repo.pulls_url),
    ]);

    const createdAt = new Date(data.created_at);
    const now = new Date();
    const daysOpen = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    const pullRequest = {
      id: data.id,
      title: data.title,
      url: data.user?.avatar_url,
      state: data.state,
      owner: data.user?.login,
      prUrl: data.html_url,
      approved,
      comments,
      resolvedComments,
      createdAt: data.created_at,
      daysOpen,
    };

    return { repo, prs: [pullRequest] }; // Mesmo formato que o resto do seu código espera
  } catch (error) {
    console.error('Erro ao buscar PR:', error);
    throw new Error("Erro ao buscar PR do repositório.");
  }
}

export async function FetchOpenPullRequests(octokit: Octokit, repo: { name: string; pulls_url: string }) {
  try {
    const { data } = await octokit.request(`GET ${repo.pulls_url}`, {
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
      per_page: 100,
      state: "open",
    });

    if (!data.length) return null;

    const pullRequests = await Promise.all(
      data.map(async (pr: any) => {
        const [comments, resolvedComments, approved] = await Promise.all([
          GetReviewCommentsCount(octokit, repo.pulls_url, pr.number),
          GetResolvedReviewThreads(octokit, repo, pr.number),
          IsPullRequestApproved(octokit, repo.pulls_url, pr.number),
        ]);

        const createdAt = new Date(pr.created_at);
        const now = new Date();
        const daysOpen = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const reviwer = pr.requested_reviewers.map((reviewer: any) => ({
          name: reviewer.login,
          avatarUrl: reviewer.avatar_url,
        }));

        return {
          id: pr.id,
          title: pr.title,
          url: pr.user?.avatar_url,
          state: pr.state,
          owner: pr.user?.login,
          prUrl: pr.html_url,
          approved,
          comments,
          resolvedComments,
          createdAt: pr.created_at,
          daysOpen,
          reviwer
        };
      })
    );

    return { repo: repo.name, prs: pullRequests };
  } catch (err: any) {
    if (err.status === 404) {
      return null; // ignora o repositório com 404
    }
    return null; // ou lance novamente, se preferir quebrar nesses casos
  }
}

export async function FetchOpenPullRequestsByOwner(octokit: Octokit) {
  const repos = await GetRepos(octokit);
  if (!repos.length) return [];

  const allPullRequests = await Promise.all(
    repos.map((repo) => FetchOpenPullRequests(octokit, repo))
  );

  return allPullRequests.filter(Boolean);
}
