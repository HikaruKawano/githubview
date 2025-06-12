import type { PullRequest, RepoPRsGroup } from "@/components/Dashboard/types";
import { GetResolvedReviewThreads, GetReviewCommentsCount, IsPullRequestApproved } from "./pullRequestService";
import { useEffect } from "react";
import pLimit from "p-limit";

type Repo = {
  name: string;
  pulls_url: string;
};

export function useIncrementalPrLoader({
  octokit,
  repos,
  setPrsData,
}: {
  octokit: any;
  repos: Repo[];
  setPrsData: React.Dispatch<React.SetStateAction<RepoPRsGroup[]>>;
}) {
  useEffect(() => {
    if (!repos.length || !octokit) return;

    const seenPRs = new Set<number>();
    const concurrencyLimit = pLimit(3); // controla chamadas paralelas

    repos.forEach(async (repo) => {
      try {
        const { data: prs } = await octokit.request(`GET ${repo.pulls_url}`, {
          headers: { 'X-GitHub-Api-Version': '2022-11-28' },
          per_page: 100,
          state: 'open',
        });

        for (const pr of prs) {
          if (seenPRs.has(pr.id)) continue;
          seenPRs.add(pr.id);

          const createdAt = new Date(pr.created_at);
          const daysOpen = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

          const placeholder: PullRequest = {
            id: pr.id,
            title: pr.title,
            owner: pr.user?.login ?? '',
            prUrl: pr.html_url,
            url: pr.user?.avatar_url ?? '',
            state: pr.state ?? '',
            approved: false,
            comments: 0,
            resolvedComments: 0,
            createdAt: pr.created_at,
            daysOpen,
            reviwer: [],
            isLoading: true,
          };

          // ⬇️ Renderiza PR incompleto de forma imediata
          setPrsData((prev) => {
            const group = prev.find(g => g.repo === repo.name);
            if (group) {
              return prev.map(g =>
                g.repo === repo.name ? { ...g, prs: [...g.prs, placeholder] } : g
              );
            }
            return [...prev, { repo: repo.name, prs: [placeholder] }];
          });

          // ⬇️ Atualiza PR com dados completos quando prontos
          concurrencyLimit(async () => {
            try {
              const [comments, resolvedComments, approved] = await Promise.all([
                GetReviewCommentsCount(octokit, repo.pulls_url, pr.number),
                GetResolvedReviewThreads(octokit, repo, pr.number),
                IsPullRequestApproved(octokit, repo.pulls_url, pr.number),
              ]);

              const reviwer = pr.requested_reviewers?.map((r: any) => ({
                name: r.login,
                avatarUrl: r.avatar_url || '',
              })) ?? [];

              const full: PullRequest = {
                ...placeholder,
                approved,
                comments,
                resolvedComments,
                reviwer,
                isLoading: false,
              };

              setPrsData(prev =>
                prev.map(group =>
                  group.repo === repo.name
                    ? {
                        ...group,
                        prs: group.prs.map(p => (p.id === pr.id ? full : p))
                      }
                    : group
                )
              );
            } catch (err) {
              console.error(`Erro ao complementar PR #${pr.number}:`, err);
            }
          });
        }
      } catch (err) {
        console.error(`Erro ao buscar PRs do repositório ${repo.name}:`, err);
      }
    });
  }, [repos, octokit, setPrsData]);
}
