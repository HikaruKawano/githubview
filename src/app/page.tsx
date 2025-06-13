// pages/dashboard/page.tsx (refatorado para carregamento progressivo)
'use client';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ThemeProvider, Box, Stack, Avatar, CircularProgress
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { SessionProvider, useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

import {
  AdvancedFilters, EmptyState, QuickFilterBar, SuggestionButtonWithModal, filterPRs
} from '../components/Dashboard/index';
import { CreateOctokit } from '@/services/github/octokit';
import { GetUserData } from '@/services/github/userService';
import { FetchOpenPullRequests, FetchReposOnly } from '@/services/github/pullRequestService';

import theme from '@/services/theme';
import { Filters, RepoPRsGroup } from '../components/Dashboard/types';
import Swal from 'sweetalert2';
import { RepositoryList } from '@/components/RepositoryList';
import UserProfileModal from '@/components/User';
import { useIncrementalPrLoader } from '@/services/github/useIncrementalPrLoader';

const DashboardComponent = () => {
  const { data: session, status } = useSession();
  const [reposData, setReposData] = useState<{ name: string; pulls_url: string }[]>([]);
  const [prsData, setPrsData] = useState<RepoPRsGroup[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPrIds, setLoadingPrIds] = useState<number[]>([]);
  const [owner, setOwner] = useState<string | undefined>(session?.user?.githubOwner);
  const [token, setToken] = useState<string | undefined>(session?.user?.token);
  const [searchQuery, setSearchQuery] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [octokit, setOctokit] = useState<any>(null);
  const [filters, setFilters] = useState<Filters>({
    repoName: '',
    owner: '',
    approved: 'all',
    reviwer: []
  });
  const githubLogin = session?.user?.githubOwner;
  const router = useRouter();

  const { updatePrManually } = useIncrementalPrLoader({
    octokit,
    repos: reposData,
    setPrsData
  });  

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

  const handleUpdatePullRequest = useCallback(async (data: any) => {
    if (!token || !owner) return;
  
    const repoName = data.repository?.name;
    const prNumber = data.pull_request?.number;
  
    if (!repoName || prNumber == null) return;
  
    const repo = reposData.find(r => r.name === repoName);
    if (!repo) return;
  
    if (data.action === 'closed') {
      setPrsData(prev => {
        const updatedGroups = prev.map(group =>
          group.repo === repoName
            ? { ...group, prs: group.prs.filter((pr: any) => pr.id !== data.pull_request.id) }
            : group
        );
        return updatedGroups.filter(group => group.prs.length > 0);
      });
      return;
    }
  
    // Força atualização incremental completa
    await updatePrManually(repo, prNumber);
  }, [token, owner, reposData, setPrsData]);  
  

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

    const loadIncrementalData = async () => {
      try {
        const createdOctokit = CreateOctokit(token);
        const [repos, user] = await Promise.all([
          FetchReposOnly(createdOctokit),
          GetUserData(createdOctokit, owner)
        ]);
        setReposData(repos);
        setUserData(user);
        setOctokit(createdOctokit);
        setLoading(false);
      } catch (error) {
        Swal.fire('Erro', 'Token ou usuário inválido', 'error');
        router.push('/login');
      }
    };

    loadIncrementalData();
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
    setFilters({ repoName: '', owner: '', approved: 'all', reviwer: [] });
    setSearchQuery('');
  };

  const hasActiveFilters = useMemo(() => {
    return filters.repoName !== '' || filters.owner !== '' || filters.approved !== 'all' || filters.reviwer.length > 0 || searchQuery !== '';
  }, [filters, searchQuery]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <SuggestionButtonWithModal onSubmit={handleSuggestionSubmit} />
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3, width: '100%', maxWidth: 1440 }}>
          {userData?.avatarUrl ? (
            <Avatar src={userData.avatarUrl} sx={{ width: 48, height: 48, cursor: 'pointer' }} onClick={() => setUserModalOpen(true)} />
          ) : (
            <Person sx={{ width: 48, height: 48 }} />
          )}
        </Stack>
        <UserProfileModal open={userModalOpen} onClose={() => setUserModalOpen(false)} owner={githubLogin} token={token} />
        <Box sx={{ width: '100%', maxWidth: 1440 }}>
          <QuickFilterBar onSearchChange={setSearchQuery} />
          <AdvancedFilters filters={filters} setFilters={setFilters} allRepos={allRepos} allOwners={allOwners} allReviewers={allReviewers} />
          {filteredPrsData.length === 0 ? (
            <EmptyState hasFilters={hasActiveFilters} onReset={resetFilters} />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(380px, 1fr))' }, gap: 3 }}>
              <RepositoryList groupedPullRequests={filteredPrsData} loading={loading} loadingPrIds={loadingPrIds} />
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const DashboardPage = () => (
  <SessionProvider>
    <DashboardComponent />
  </SessionProvider>
);

export default DashboardPage;
