export interface Reviwer {
  name: string;
  avatarUrl: string;
}

export interface PullRequest {
  id: number;
  title: string;
  url: string;
  state: string;
  owner: string;
  prUrl: string;
  approved: boolean;
  comments: number;
  resolvedComments: number;
  createdAt: string;
  daysOpen: number;
  reviwer: Reviwer[];
}

export interface RepoPRsGroup {
  repo: string;
  prs: PullRequest[];
}

export interface Filters {
  repoName: string;
  owner: string | string[];
  approved: 'all' | 'approved' | 'not-approved';
  reviwer: string[];
}

export interface FilterPRs {
  byRepo: (data: RepoPRsGroup[], repoName: string) => RepoPRsGroup[];
  byOwner: (data: RepoPRsGroup[], owner: string | string[]) => RepoPRsGroup[];
  byApproval: (data: RepoPRsGroup[], approved: 'all' | 'approved' | 'not-approved') => RepoPRsGroup[];
  byReviewers: (data: RepoPRsGroup[], reviewers: string[]) => RepoPRsGroup[];
  combine: (data: RepoPRsGroup[], filters: Filters) => RepoPRsGroup[];
}

export const filterPRs: FilterPRs = {
  byRepo: (data: RepoPRsGroup[], repoName: string): RepoPRsGroup[] => {
    if (!repoName) return data;
    return data.filter(group =>
      group.repo.toLowerCase().includes(repoName.toLowerCase())
    );
  },

  byOwner: (data: RepoPRsGroup[], owner: string | string[]): RepoPRsGroup[] => {
    if (!owner || (Array.isArray(owner) && owner.length === 0)) return data;

    const ownersArray = Array.isArray(owner) ? owner : [owner];

    return data.map(group => ({
      ...group,
      prs: group.prs.filter(pr =>
        ownersArray.some(o =>
          pr.owner.toLowerCase().includes(o.toLowerCase())
        )
      )
    })).filter(group => group.prs.length > 0);
  },

  byApproval: (data: RepoPRsGroup[], approved: 'all' | 'approved' | 'not-approved'): RepoPRsGroup[] => {
    if (approved === 'all') return data;
    return data.map(group => ({
      ...group,
      prs: group.prs.filter(pr =>
        approved === 'approved' ? pr.approved : !pr.approved
      )
    })).filter(group => group.prs.length > 0);
  },

  byReviewers: (data: RepoPRsGroup[], reviewers: string[]): RepoPRsGroup[] => {
    if (!reviewers || reviewers.length === 0) return data;

    return data.map(group => ({
      ...group,
      prs: group.prs.filter(pr =>
        pr.reviwer?.some(r =>
          reviewers.some(filterReviewer =>
            r.name.toLowerCase().includes(filterReviewer.toLowerCase())
          )
        )
      )
    })).filter(group => group.prs.length > 0);
  },

  combine: (data: RepoPRsGroup[], filters: Filters): RepoPRsGroup[] => {
    let result = [...data];
    result = filterPRs.byApproval(result, filters.approved);
    result = filterPRs.byRepo(result, filters.repoName);
    result = filterPRs.byOwner(result, filters.owner);
    result = filterPRs.byReviewers(result, filters.reviwer);
    return result;
  }
};