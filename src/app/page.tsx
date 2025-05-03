  'use client';
  import { useCallback, useEffect, useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { ThemeProvider, Box, Stack, Avatar, CircularProgress } from '@mui/material';
  import { RepositoryList } from '../components/RepositoryList';
  import { RepositoryDialog } from '../components/RepositoryDialog';
  import theme from '@/services/theme';
  import { Person } from '@mui/icons-material';
  import UserProfile from '@/components/User';
  import Swal from 'sweetalert2';
  import { io, Socket } from 'socket.io-client';
  import { CreateOctokit } from '@/services/github/octokit';
  import { GetUserData } from '@/services/github/userService';
  import { GetRepos } from '@/services/github/repoService';
  import { FetchOpenPullRequestsByOwner, FetchSinglePullRequest } from '@/services/github/pullRequestService';
  import { SessionProvider, useSession } from 'next-auth/react';

  export default function Dashboard() {
    const { data: session, status } = useSession();
    const [reposData, setReposData] = useState<string[]>([]);
    const [prsData, setPrsData] = useState<any[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [cardLoading, setCardLoading] = useState(false);
    const [loadingPrIds, setLoadingPrIds] = useState<number[]>([]);
    const [owner, setOwner] = useState<string | undefined>(session?.user?.githubOwner);
    const [token, setToken] = useState<string | undefined>(session?.user?.token);

    const router = useRouter();

    const removePrIdFromLoading = (id: number) => {
      setLoadingPrIds(prev => prev.filter(prId => prId !== id));
    };

    const handleUpdatePullRequest = useCallback(async (data: any) => {
      if (!token || !owner) return;

      try {
        const octokit = CreateOctokit(token);
        const repoName = data.repository?.name;
        const prId = data.pull_request?.id;
        const prNumber = data.pull_request?.number;

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

        const checkCommentsDifference = (freshPrData: { prs: any[] }) => {
          let changed = false;
          freshPrData.prs.forEach((freshPr) => {
            const prsGroup = prsData.find(g => g.prs.some((pr: any) => pr.id === freshPr.id));
            if (prsGroup) {
              const pr = prsGroup.prs.find((pr: any) => pr.id === freshPr.id);
              if (pr) {
                if (data.action === 'created') pr.comments++;
                else if (data.action === 'deleted') pr.comments--;
                if (pr.comments !== freshPr.comments) changed = true;
              }
            }
          });
          return changed;
        };

        if (['created', 'deleted'].includes(data.action)) {
          setCardLoading(true);
          setLoadingPrIds(prev => prev.includes(prId) ? prev : [...prev, prId]);

          let freshPrData;
          let attempt = 0;

          while (attempt < 3) {
            await new Promise(res => setTimeout(res, 10000));
            freshPrData = await FetchSinglePullRequest(octokit, owner, repoName, prNumber);
            if (checkCommentsDifference(freshPrData)) break;
            attempt++;
          }

          const freshPr = freshPrData?.prs?.[0];
          if (!freshPr) {
            removePrIdFromLoading(prId);
            return;
          }

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

          setCardLoading(false);
          removePrIdFromLoading(prId);
          return;
        }

        if (data.action === 'opened') {
          setLoadingPrIds(prev => prev.includes(prId) ? prev : [...prev, prId]);
          const freshPrData = await FetchSinglePullRequest(octokit, owner, repoName, prNumber);
          const freshPr = freshPrData?.prs?.[0];
          if (!freshPr) {
            removePrIdFromLoading(prId);
            return;
          }

          setPrsData(prev => {
            const repoExists = prev.some(group => group.repo === repoName);
            if (repoExists) {
              return prev.map(group =>
                group.repo === repoName
                  ? {
                    ...group,
                    prs: group.prs.some((pr: any) => pr.id === freshPr.id)
                      ? group.prs.map((pr: any) => (pr.id === freshPr.id ? freshPr : pr))
                      : [...group.prs, freshPr]
                  }
                  : group
              );
            } else {
              return [...prev, { repo: repoName, prs: [freshPr] }];
            }
          });

          removePrIdFromLoading(prId);
          return;
        }

        const freshPrData = await FetchSinglePullRequest(octokit, owner, repoName, prNumber);
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
    }, [token, owner, prsData]);

    useEffect(() => {
      if (status === 'loading') return;

      if (status === 'unauthenticated')
        router.push('/login');

      if (status === 'authenticated')
        setToken(session?.user.token);
      setOwner(session?.user.githubOwner);

    }, [status, token, owner, router]);

    useEffect(() => {
      if (!token || !owner) return;

      const socket: Socket = io({ path: '/api/socket' });

      socket.on('connect', () => { });

      socket.on('new-webhook-event', (data) => {
        handleUpdatePullRequest(data);
      });

      socket.on('disconnect', () => { });

      return () => {
        socket.disconnect();
      };
    }, [token, owner, handleUpdatePullRequest]);

    useEffect(() => {
      if (!token || !owner) return;
      const loadData = async () => {
        try {
          const octokit = CreateOctokit(token);
          const repos = await GetRepos(octokit);
          const prsPromises = await FetchOpenPullRequestsByOwner(octokit, owner);
          const prsResults = await Promise.all(prsPromises);
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

    return (
      <ThemeProvider theme={theme}>
        <SessionProvider>
          <Box
            sx={{
              minHeight: '100vh',
              background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3, width: '100%', maxWidth: 1440 }}>
              {userData?.avatarUrl
                ? (
                  <Avatar
                    src={userData.avatarUrl}
                    onClick={() => setOpenModal(true)}
                    sx={{
                      width: 48,
                      height: 48,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                      },
                      transition: 'all 0.3s ease'
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
                      borderRadius: '50%',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />
                )}
            </Stack>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, width: '100%' }}>
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{
                    color: theme.palette.success.main,
                    '& circle': { strokeLinecap: 'round' }
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(380px, 1fr))' },
                  gap: 3,
                  width: '100%',
                  maxWidth: 1440,
                }}
              >
                <UserProfile open={openModal} onClose={() => setOpenModal(false)} owner={owner} token={token} />
                <RepositoryList groupedPullRequests={prsData} onCardsReady={() => setLoading(false)} loading={cardLoading} loadingPrIds={loadingPrIds} />
                <RepositoryDialog open={openDialog} onClose={() => setOpenDialog(false)} repos={reposData} />
              </Box>
            )}
          </Box>
        </SessionProvider>
      </ThemeProvider>
    );
  }
