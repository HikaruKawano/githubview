'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider, Box } from '@mui/material';
import { FetchOpenPullRequestsByRepo, GetRepos } from '@/lib/github';
import { RepositoryList } from '../components/RepositoryList';
import { RepositoryDialog } from '../components/RepositoryDialog';
import theme from '@/lib/theme';

export default function Dashboard() {
  const [groupedPullRequests, setGroupedPullRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [token, setToken] = useState<string>();
  const [owner, setOwner] = useState<string>();

  const router = useRouter();

  // Função para buscar cookies de forma segura
  const getCookie = (name: string) => {
    if (typeof window === 'undefined') return undefined;
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1] ?? undefined;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedToken = getCookie('authToken');
    const savedOwner = getCookie('githubOwner');

    if (savedToken && savedOwner) {
      setToken(savedToken);
      setOwner(savedOwner);
    } else {
      router.push('/login');
    }
  }, [router]);

  // Carrega os repositórios e PRs ao obter o token e o owner
  useEffect(() => {
    const loadData = async () => {
      if (!token || !owner) return;

      try {
        const [reposData, prsData] = await Promise.all([
          GetRepos(owner, token),
          FetchOpenPullRequestsByRepo(owner, token),
        ]);
        setRepos(reposData);
        setGroupedPullRequests(prsData);
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, owner]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 2, display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'hidden' }}>
        <RepositoryList groupedPullRequests={groupedPullRequests} loading={loading} />
        <RepositoryDialog open={openDialog} onClose={() => setOpenDialog(false)} repos={repos} />
      </Box>
    </ThemeProvider>
  );
}
