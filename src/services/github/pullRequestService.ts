// services/github/pullRequestService.ts
import { Octokit } from "octokit";
import { GetRepos } from "./repoService";
import pLimit from 'p-limit';

const headers = { "X-GitHub-Api-Version": "2022-11-28" };

export async function GetReviewCommentsCount(octokit: Octokit, url: string, pullNumber?: number) {
  try {
    const endpoint = pullNumber === undefined
      ? `${url}/comments`
      : `${url}/${pullNumber}/comments`;

    const { data } = await octokit.request(`GET ${endpoint}`, {
      headers,
      per_page: 100,
    });

    return data.length;
  } catch {
    throw new Error("Erro ao buscar comentários do PR.");
  }
}

export async function IsPullRequestApproved(octokit: Octokit, url: string, pullNumber?: number) {
  const endpoint = pullNumber === undefined
    ? `${url}/comments`
    : `${url}/${pullNumber}/reviews`;
  try {
    const { data } = await octokit.request(`GET ${endpoint}`, { headers });
    return data.some((review: any) => review.state === "APPROVED");
  } catch {
    throw new Error("Erro ao buscar revisões do PR.");
  }
}

export async function GetResolvedReviewThreads(octokit: Octokit, repo: { name: string; pulls_url: string }, pullNumber: number) {
  const owner = repo.pulls_url.match(/(?<=https:\/\/api\.github\.com\/repos\/)[^\/]+/);
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

export async function FetchOpenPullRequests(octokit: Octokit, repo: { name: string; pulls_url: string }) {
  try {
    const { data } = await octokit.request(`GET ${repo.pulls_url}`, {
      headers,
      per_page: 100,
      state: "open",
    });

    if (!data.length) return null;

    const limit = pLimit(3);

    const pullRequests = await Promise.all(
      data.map((pr: any) => limit(async () => {
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
      }))
    );

    return { repo: repo.name, prs: pullRequests };
  } catch (err: any) {
    if (err.status === 404) return null;
    return null;
  }
}

export async function FetchReposOnly(octokit: Octokit) {
  const repos = await GetRepos(octokit);
  return repos.length ? repos : [];
}
