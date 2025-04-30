// services/github/pullRequestService.ts
import { Octokit } from "octokit";
import { GetRepos } from "./repoService";

async function GetReviewCommentsCount(octokit: Octokit, owner: string, repo: string, pullNumber: number) {
  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/comments", {
      owner,
      repo,
      pull_number: pullNumber,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
      per_page: 100,
    });

    console.log("Comments data:", data); // Log the comments data for debugging

    return data.length;
  } catch {
    throw new Error("Erro ao buscar comentários do PR.");
  }
}

async function IsPullRequestApproved(octokit: Octokit, owner: string, repo: string, pullNumber: number) {
  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews", {
      owner,
      repo,
      pull_number: pullNumber,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });

    return data.some((review) => review.state === "APPROVED");
  } catch {
    throw new Error("Erro ao buscar revisões do PR.");
  }
}

async function GetResolvedReviewThreads(octokit: Octokit, owner: string, repo: string, pullNumber: number) {
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

  const variables = { owner, repo, pull_number: pullNumber };

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
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
      owner,
      repo,
      pull_number: prNumber, // << o correto aqui
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });

    const [comments, resolvedComments, approved] = await Promise.all([
      await GetReviewCommentsCount(octokit, owner, repo, prNumber),
      await GetResolvedReviewThreads(octokit, owner, repo, prNumber),
      await IsPullRequestApproved(octokit, owner, repo, prNumber),
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

export async function FetchOpenPullRequests(octokit: Octokit, owner: string, repo: string) {
  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
      owner,
      repo,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
      per_page: 100,
      state: "open",
    });

    if (!data.length) return null;

    const pullRequests = await Promise.all(
      data.map(async (pr) => {
        const [comments, resolvedComments, approved] = await Promise.all([
          GetReviewCommentsCount(octokit, owner, repo, pr.number),
          GetResolvedReviewThreads(octokit, owner, repo, pr.number),
          IsPullRequestApproved(octokit, owner, repo, pr.number),
        ]);

        const createdAt = new Date(pr.created_at);
        const now = new Date();
        const daysOpen = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

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
        };
      })
    );

    return { repo, prs: pullRequests };
  } catch {
    throw new Error("Erro ao buscar PRs do repositório.");
  }
}

export async function FetchOpenPullRequestsByOwner(octokit: Octokit, owner: string) {
  const repos = await GetRepos(octokit, owner);
  if (!repos.length) return [];

  const allPullRequests = await Promise.all(
    repos.map((repo) => FetchOpenPullRequests(octokit, owner, repo))
  );

  return allPullRequests.filter(Boolean);
}
