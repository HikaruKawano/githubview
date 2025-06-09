'use client';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ThemeProvider, Box, Stack, Avatar, CircularProgress, Button
} from '@mui/material';
import { Person, Feedback } from '@mui/icons-material';
import { SessionProvider, useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

import {
  AdvancedFilters, EmptyState, QuickFilterBar, SuggestionButtonWithModal, filterPRs
} from '../components/Dashboard/index';
import { CreateOctokit } from '@/services/github/octokit';
import { GetUserData } from '@/services/github/userService';
import { GetRepos } from '@/services/github/repoService';
import {
  FetchOpenPullRequestsByOwner,
  FetchSinglePullRequest
} from '@/services/github/pullRequestService';
import theme from '@/services/theme';
import { Filters, RepoPRsGroup } from '../components/Dashboard/types';
import Swal from 'sweetalert2';
import { RepositoryList } from '@/components/RepositoryList';
import UserProfileModal from '@/components/User';

const DashboardComponent = () => {
  const { data: session, status } = useSession();
  const [reposData, setReposData] = useState<{ name: string; pulls_url: string }[]>([]);
  const [prsData, setPrsData] = useState<RepoPRsGroup[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(false);
  const [loadingPrIds, setLoadingPrIds] = useState<number[]>([]);
  const [owner, setOwner] = useState<string | undefined>(session?.user?.githubOwner);
  const [token, setToken] = useState<string | undefined>(session?.user?.token);
  const [searchQuery, setSearchQuery] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    repoName: '',
    owner: '',
    approved: 'all',
    reviwer: []
  });
  const githubLogin = session?.user?.githubOwner;

  const router = useRouter();

  const allRepos = useMemo(() => {
    const repos = new Set<string>();
    prsData.forEach(group => repos.add(group.repo));
    return Array.from(repos).sort();
  }, [prsData]);

  const allOwners = useMemo(() => {
    const owners = new Set<string>();
    prsData.forEach(group => {
      group.prs.forEach(pr => owners.add(pr.owner));
    });
    return Array.from(owners).sort();
  }, [prsData]);

  const allReviewers = useMemo(() => {
    const reviwer = new Set<string>();
    prsData.forEach(group => {
      group.prs.forEach(pr => {
        pr.reviwer?.forEach(r => reviwer.add(r.name));
      });
    });
    return Array.from(reviwer).sort();
  }, [prsData]);

  const handleUpdatePullRequest = useCallback(async (data: any) => {
    if (!token || !owner) return;

    try {
      const octokit = CreateOctokit(token);
      const repoName = data.repository?.name;
      const prId = data.pull_request?.id;
      const prNumber = data.pull_request?.number;
      const url = data.pull_request?.url;

      if (!repoName || !prId) return;

      if (data.action === 'closed') {
        setPrsData(prev => {
          const updatedGroups = prev.map(group =>
            group.repo === repoName
              ? { ...group, prs: group.prs.filter((pr: any) => pr.id !== prId) }
              : group
          );
          return updatedGroups.filter(group => group.prs.length > 0);
        });
        return;
      }

      const freshPrData = await FetchSinglePullRequest(octokit, { name: repoName, pulls_url: url }, prNumber);
      const freshPr = freshPrData?.prs?.[0];
      if (!freshPr) return;

      setPrsData(prev =>
        prev.map(group =>
          group.repo === repoName
            ? {
              ...group,
              prs: group.prs.map((pr: any) => (pr.id === freshPr.id ? freshPr : pr))
            }
            : group
        )
      );
    } catch (err) {
      console.error('Erro ao atualizar PR:', err);
    }
  }, [token, owner]);

  const handleSuggestionSubmit = async (text: string) => {
    const response = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suggestion: text }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Falha ao enviar sugestão');
    }
    return response.json();
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      setToken(session?.user.token);
      setOwner(session?.user.githubOwner);
    }
  }, [status, router, session]);

  useEffect(() => {
    if (!token || !owner) return;

    const socket: Socket = io({ path: '/api/socket' });
    socket.on('new-webhook-event', handleUpdatePullRequest);
    return () => { socket.disconnect(); };
  }, [token, owner, handleUpdatePullRequest]);

  useEffect(() => {
    if (!token || !owner) return;
    const loadData = async () => {
      try {
        const octokit = CreateOctokit(token);
        const repos = await GetRepos(octokit);
        const prsPromises = await FetchOpenPullRequestsByOwner(octokit);
        const prsResults = (await Promise.all(prsPromises))
          .filter((result): result is RepoPRsGroup => result !== null);
        const user = await GetUserData(octokit, owner);

        setReposData(repos);
        setPrsData(prsResults);
        setUserData(user);
        setLoading(false);
      } catch (error) {
        Swal.fire('Erro', 'Token ou usuário inválido', 'error');
        router.push('/login');
      }
    };

    loadData();
  }, [token, owner, router]);

  const filteredPrsData = useMemo(() => {
    let result = filterPRs.combine(prsData, filters);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.map(group => ({
        ...group,
        prs: group.prs.filter(pr =>
          group.repo.toLowerCase().includes(query) ||
          pr.title.toLowerCase().includes(query) ||
          pr.owner.toLowerCase().includes(query)
        )
      })).filter(group => group.prs.length > 0);
    }

    return result;
  }, [prsData, filters, searchQuery]);

  const resetFilters = () => {
    setFilters({
      repoName: '',
      owner: '',
      approved: 'all',
      reviwer: []
    });
    setSearchQuery('');
  };

  const hasActiveFilters = useMemo(() => {
    return filters.repoName !== '' || filters.owner !== '' || filters.approved !== 'all' || filters.reviwer.length > 0 || searchQuery !== '';
  }, [filters, searchQuery]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative'
        }}
      >

        <SuggestionButtonWithModal
          onSubmit={handleSuggestionSubmit}
        />

        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3, width: '100%', maxWidth: 1440 }}>
          {userData?.avatarUrl ? (
            <Avatar
              src={userData.avatarUrl}
              sx={{
                width: 48,
                height: 48,
                cursor: 'pointer',
              }}
              onClick={() => setUserModalOpen(true)} // Abre o modal ao clicar
            />
          ) : (
            <Person sx={{ width: 48, height: 48 }} />
          )}
        </Stack>

        <UserProfileModal
          open={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          owner={githubLogin}
          token={token}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, width: '100%' }}>
            <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.success.main }} />
          </Box>
        ) : (
          <Box sx={{ width: '100%', maxWidth: 1440 }}>
            <QuickFilterBar onSearchChange={setSearchQuery} />
            <AdvancedFilters
              filters={filters}
              setFilters={setFilters}
              allRepos={allRepos}
              allOwners={allOwners}
              allReviewers={allReviewers}
            />

            {filteredPrsData.length === 0 ? (
              <EmptyState
                hasFilters={hasActiveFilters}
                onReset={resetFilters}
              />
            ) : (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(380px, 1fr))' },
                gap: 3
              }}>
                <RepositoryList
                  groupedPullRequests={filteredPrsData.map(group => ({
                    ...group,
                    prs: group.prs.map(pr => ({
                      ...pr,
                      reviwer: pr.reviwer, // Map reviewer to reviwer
                    })),
                  }))}
                  loading={cardLoading}
                  loadingPrIds={loadingPrIds}
                />

              </Box>
            )}
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

const DashboardPage = () => {
  return (
    <SessionProvider>
      <DashboardComponent />
    </SessionProvider>
  );
};

export default DashboardPage;