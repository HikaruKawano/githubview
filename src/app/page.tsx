'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider, Box, Stack } from '@mui/material';
import { FetchOpenPullRequestsByRepo, GetRepos } from '@/lib/github';
import { RepositoryList } from '../components/RepositoryList';
import { RepositoryDialog } from '../components/RepositoryDialog';
import theme from '@/lib/theme';
import { Person, PersonOffOutlined } from '@mui/icons-material';

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

  const fetchReviewCommentsCount = async (owner: string, repo: string, pullNumber: number, token: string) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (!response.ok) throw new Error('Erro ao buscar comentários');

      const comments = await response.json();
      return comments.length;
    } catch (error) {
      console.error(`Erro ao buscar comentários para PR #${pullNumber} em ${repo}`, error);
      return 0;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      
        <Person sx={{bgcolor: theme.palette.grey[500]}}/>
     
      <Box sx={{ padding: 2, display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'hidden' }}>
        <RepositoryList groupedPullRequests={groupedPullRequests} loading={loading} />
        <RepositoryDialog open={openDialog} onClose={() => setOpenDialog(false)} repos={repos} />
      </Box>
    </ThemeProvider>
  );
}
