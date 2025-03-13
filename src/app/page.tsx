'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider, Box, Stack, Avatar } from '@mui/material';
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
  const [token, setToken] = useState<string>();
  const [owner, setOwner] = useState<string>();
  const [userData, setUserData] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);

  const router = useRouter();

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

  useEffect(() => {
    const loadData = async () => {
      if (!token || !owner) return;

      try {
        const [reposData, prsData, userData] = await Promise.all([
          GetRepos(owner, token),
          FetchOpenPullRequestsByRepo(owner, token),
          GetUserData(owner, token),
        ]);

        setRepos(reposData);
        setGroupedPullRequests(prsData);
        setUserData(userData);
      } catch (error: any) {
        Swal.fire("Erro", "Tokem ou usuario invalido", "error");
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, owner]);

  if (loading) return null;

  console.log(groupedPullRequests);
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
        <RepositoryList groupedPullRequests={groupedPullRequests} loading={loading} />
        <RepositoryDialog open={openDialog} onClose={() => setOpenDialog(false)} repos={repos} />
      </Box>
    </ThemeProvider>
  );
}
