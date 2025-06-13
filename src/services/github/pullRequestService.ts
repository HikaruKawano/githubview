// services/github/pullRequestService.ts
import { Octokit } from "octokit";
import { GetRepos } from "./repoService";
import pLimit from 'p-limit';

const headers = { "X-GitHub-Api-Version": "2022-11-28" };

export async function GetReviewCommentsCount(octokit: Octokit, url: string, pullNumber: number) {
  try {
    const endpoint = `${url}/${pullNumber}/comments`;
    const { data } = await octokit.request(`GET ${endpoint}`, {
      headers,
      per_page: 100,
    });
    return data.length;
  } catch {
    throw new Error("Erro ao buscar comentários do PR.");
  }
}

export async function IsPullRequestApproved(octokit: Octokit, url: string, pullNumber: number) {
  try {
    const endpoint = `${url}/${pullNumber}/reviews`;
    const { data } = await octokit.request(`GET ${endpoint}`, { headers });
    return data.some((review: any) => review.state === "APPROVED");
  } catch {
    throw new Error("Erro ao buscar revisões do PR.");
  }
}

export async function GetResolvedReviewThreads(
  octokit: Octokit,
  repo: { name: string; pulls_url: string },
  pullNumber: number
) {
  const owner = repo.pulls_url.match(/(?<=https:\/\/api\.github\.com\/repos\/)[^\/]+/)?.[0];
  if (!owner) throw new Error("Owner não encontrado na URL.");

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

  const variables = { owner, repo: repo.name, pull_number: pullNumber };

  const response = await octokit.graphql(query, variables) as {
    repository: {
      pullRequest: {
        reviewThreads: { nodes: { isResolved: boolean }[] }
      }
    }
  };

  const resolvedThreads = response.repository.pullRequest.reviewThreads.nodes;
  return resolvedThreads.filter(thread => thread.isResolved).length;
}

export async function FetchOpenPullRequests(
  octokit: Octokit,
  repo: { name: string; pulls_url: string }
) {
  try {
    const { data } = await octokit.request(`GET ${repo.pulls_url}`, {
      headers,
      per_page: 100,
      state: "open",
    });

    if (!data.length) return null;

    // Simplificado: retornando apenas dados básicos
    const simplifiedPRs = data.map((pr: any) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      url: pr.user?.avatar_url,
      state: pr.state,
      owner: pr.user?.login,
      prUrl: pr.html_url,
      createdAt: pr.created_at,
      requested_reviewers: pr.requested_reviewers,
      base: pr.base,
    }));

    return { repo: repo.name, prs: simplifiedPRs };
  } catch (err: any) {
    if (err.status === 404) return null;
    return null;
  }
}

export async function FetchReposOnly(octokit: Octokit) {
  const repos = await GetRepos(octokit);
  return repos.length ? repos : [];
}
