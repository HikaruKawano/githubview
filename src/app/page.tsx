// Dashboard.tsx
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
  const [token, setToken] = useState<string | undefined>(undefined);
  const [owner, setOwner] = useState<string | undefined>(undefined);
  const [userData, setUserData] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
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
      } catch (error) {
        Swal.fire('Erro', 'Token ou usuário inválido', 'error');
        router.push('/login');
      }
    };

    loadData();
  }, [token, owner, router]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.background.default,
          p: 3
        }}
      >
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
          {userData?.avatar_url ? (
            <Avatar
              src={userData.avatar_url}
              onClick={() => setOpenModal(true)}
              sx={{
                width: 48,
                height: 48,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.05)' }
              }}
            />
          ) : (
            <Person
              sx={{
                color: 'text.secondary',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                width: 48,
                height: 48,
                p: 1,
                borderRadius: '50%'
              }}
            />
          )}
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', height: '80vh' }}>
            <CircularProgress
              size={60}
              thickness={4}
              sx={{ color: theme.palette.success.main }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(380px, 1fr))' },
              gap: 3,
              maxWidth: 1440,
              mx: 'auto'
            }}
          >

            <UserProfile
              open={openModal}
              onClose={() => setOpenModal(false)}
              owner={owner}
              token={token}
              // sx={{
              //   '& .MuiPaper-root': {
              //     background: 'rgba(32, 32, 32, 0.9)',
              //     backdropFilter: 'blur(12px)',
              //     border: '1px solid rgba(255, 255, 255, 0.1)',
              //     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              //   }
              // }}
            />

            <RepositoryList
              groupedPullRequests={groupedPullRequests}
              onCardsReady={() => setLoading(false)} loading={false} />
            <RepositoryDialog open={openDialog} onClose={() => setOpenDialog(false)} repos={repos} />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}