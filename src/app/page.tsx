'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider, Box, Stack, Avatar, CircularProgress } from '@mui/material';
import { FetchOpenPullRequestsByRepo, GetRepos, GetUserData } from '@/lib/github';
import { RepositoryList } from '../components/RepositoryList';
import { RepositoryDialog } from '../components/RepositoryDialog';
import theme from '@/lib/theme';
import { Person } from '@mui/icons-material';
import UserProfile from '@/components/User';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const [groupedPullRequests, setGroupedPullRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1] ?? null;

    const savedOwner = document.cookie
      .split('; ')
      .find(row => row.startsWith('githubOwner='))
      ?.split('=')[1] ?? null;

    if (!savedToken || !savedOwner) {
      router.push('/login');
    } else {
      setToken(savedToken);
      setOwner(savedOwner);
    }
  }, [router]);

  useEffect(() => {
    if (!token || !owner) return;

    const loadData = async () => {
      try {
        const [reposData, prsData, userData] = await Promise.all([
          GetRepos(owner, token),
          FetchOpenPullRequestsByRepo(owner, token),
          GetUserData(owner, token),
        ]);

        setRepos(reposData);
        setGroupedPullRequests(prsData);
        setUserData(userData);
        setLoading(false);
      } catch (error: any) {
        Swal.fire('Erro', 'Token ou usuário inválido', 'error');
        router.push('/login');
      }
    };

    loadData();
  }, [token, owner]);

  if (!token || !owner) {
    return null;
  }

  if (loading)
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.background.default,
          }}
        >
          <CircularProgress size={60} thickness={4} color="success" />
        </Box>
      </ThemeProvider>
    );

  return (
    <ThemeProvider theme={theme}>
      <Stack direction="row" alignItems="center" justifyContent="end">
        {userData?.avatar_url ? (
          <Avatar
            src={userData.avatar_url}
            onClick={() => setOpenModal(true)}
            sx={{
              width: '55px',
              height: '55px',
              borderRadius: '50%',
              cursor: 'pointer',
              margin: '10px',
            }}
          />
        ) : (
          <Person
            sx={{
              bgcolor: theme.palette.grey[500],
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              padding: 1,
              m: 2,
            }}
          />
        )}
      </Stack>
      <Box
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <UserProfile
          open={openModal}
          onClose={() => setOpenModal(false)}
          owner={owner}
          token={token}
        />
        <RepositoryList
          groupedPullRequests={groupedPullRequests}
          loading={loading}
          onCardsReady={() => setLoading(false)}
        />
        <RepositoryDialog open={openDialog} onClose={() => setOpenDialog(false)} repos={repos} />
      </Box>
    </ThemeProvider>
  );
}
