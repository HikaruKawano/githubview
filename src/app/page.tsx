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

export default function Dashboard() {
  const [reposData, setReposData] = useState<string[]>([]);
  const [prsData, setPrsData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [owner, setOwner] = useState<string | undefined>(undefined);
  const [openModal, setOpenModal] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [loadingPrIds, setLoadingPrIds] = useState<number[]>([]);

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

      if (!repoName || !prId) {
        return;
      }

      if (data.action === 'closed') {
        setPrsData(prevPrsData => {
          const updatedGroups = prevPrsData.map(group => {
            if (group.repo === repoName) {
              const filteredPrs = group.prs.filter((pr: { id: number }) => pr.id !== prId);
              return { ...group, prs: filteredPrs };
            }
            return group;
          });
          return updatedGroups.filter(group => group.prs.length > 0);
        });
        return;
      }

      const checkCommentsDifference = (freshPrData: { repo?: string; prs: any; }) => {
        let commentsChanged = false;
      
        freshPrData.prs.forEach((freshPr: { id: any; comments: any }) => {
          const prsPr = prsData.find((prData) =>
            prData.prs.some((pr: { id: number }) => pr.id === freshPr.id)
          );
          if (prsPr) {
            const prInPrs = prsPr.prs.find((pr: { id: number }) => pr.id === freshPr.id);
            if (prInPrs) {
              if (data.action === 'created') {
                prInPrs.comments ++;
              } else if (data.action === 'deleted') {
                prInPrs.comments --;
              }
      
              if (prInPrs.comments !== freshPr.comments) {
                commentsChanged = true;
              }
            }
          }
        });
      
        return commentsChanged;
      };
      
      const waitForDataUpdate = async (sum: number) => {
        await new Promise(resolve => setTimeout(resolve, 10000 + sum));
      };
      
      if (['created', 'deleted'].includes(data.action)) {
        setCardLoading(true);
        setLoadingPrIds(prev => prev.includes(prId) ? prev : [...prev, prId]);
      
        let freshPrData;
        let attemptCount = 0;
      
        while (attemptCount < 3) {  // Limitar o número de tentativas para evitar loop infinito
          await waitForDataUpdate(10000);
          freshPrData = await FetchSinglePullRequest(octokit, owner, repoName, prNumber);
          
          if (checkCommentsDifference(freshPrData)) {
            break;  // Se os comentários foram alterados, sair do loop
          }

          attemptCount++;
        }
      
        if (!freshPrData || !freshPrData?.prs?.[0]) {
          console.warn('PR atualizado não encontrado.');
          removePrIdFromLoading(prId);
          return;
        }
      
        const freshPr = freshPrData?.prs?.[0];
      
        setPrsData(prevPrsData =>
          prevPrsData.map(group =>
            group.repo === repoName
              ? {
                  ...group,
                  prs: group.prs.map((pr: { id: number }) =>
                    pr.id === freshPr.id ? freshPr : pr
                  )
                }
              : group
          )
        );
      
        setCardLoading(false);
        removePrIdFromLoading(prId);
      }
      
      if (data.action === 'opened') {
        setLoadingPrIds(prev => prev.includes(prId) ? prev : [...prev, prId]);
        const freshPrData = await FetchSinglePullRequest(octokit, owner, repoName, prNumber);
        const freshPr = freshPrData?.prs?.[0];

        if (!freshPr) {
          removePrIdFromLoading(prId);
          return;
        }

        setPrsData(prevPrsData => {
          const repoExists = prevPrsData.some(group => group.repo === repoName);
          if (repoExists) {
            return prevPrsData.map(group =>
              group.repo === repoName
                ? {
                    ...group,
                    prs: group.prs.some((pr: { id: number }) => pr.id === freshPr.id)
                      ? group.prs.map((pr: { id: number }) => pr.id === freshPr.id ? freshPr : pr)
                      : [...group.prs, freshPr]
                  }
                : group
            );
          } else {
            return [...prevPrsData, { repo: repoName, prs: [freshPr] }];
          }
        });
        removePrIdFromLoading(prId);
        return;
      }

      const freshPrData = await FetchSinglePullRequest(octokit, owner, repoName, prNumber);
      const freshPr = freshPrData?.prs?.[0];

      if (!freshPr) {
        return;
      }

      setPrsData(prevPrsData =>
        prevPrsData.map(group =>
          group.repo === repoName
            ? {
                ...group,
                prs: group.prs.map((pr: { id: number }) =>
                  pr.id === freshPr.id ? freshPr : pr
                )
              }
            : group
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar PR:', error);
    }
  }, [token, owner]);

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

    const socket: Socket = io({ path: '/api/socket' });

    socket.on('connect', () => {});

    socket.on('new-webhook-event', (data) => {
      handleUpdatePullRequest(data);
    });

    socket.on('disconnect', () => {});

    return () => {
      socket.disconnect();
    };
  }, [token, owner, handleUpdatePullRequest]);

  useEffect(() => {
    if (!token || !owner) return;

    const loadData = async () => {
      try {
        const octokit = CreateOctokit(token);

        const repos = await GetRepos(octokit, owner);
        setReposData(repos);

        const prsPromises = await FetchOpenPullRequestsByOwner(octokit, owner);
        const prsResults = await Promise.all(prsPromises);
        setPrsData(prsResults);

        const user = await GetUserData(octokit, owner);
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
          {userData?.avatar_url ? (
            <Avatar
              src={userData.avatar_url}
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
            <UserProfile
              open={openModal}
              onClose={() => setOpenModal(false)}
              owner={owner}
              token={token}
            />

            <RepositoryList
              groupedPullRequests={prsData}
              onCardsReady={() => setLoading(false)}
              loading={cardLoading}
              loadingPrIds={loadingPrIds}
            />

            <RepositoryDialog
              open={openDialog}
              onClose={() => setOpenDialog(false)}
              repos={reposData}
            />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
