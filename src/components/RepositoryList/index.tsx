import { Stack, Typography, Box } from '@mui/material';
import { PullRequestCard } from '../PullRequestCard';
import CardItem from '../Card';

interface RepositoryListProps {
  groupedPullRequests: Array<{
    repo: string;
    prs: Array<{
      id: string;
      title: string;
      owner?: string;
      prUrl: string;
      approved: boolean;
      comments: number;
      daysOpen: number;
      resolvedComments: number,
    }>;
  }>;
  loading: boolean;
}

export function RepositoryList({ groupedPullRequests, loading }: RepositoryListProps) {
  console.log(groupedPullRequests)
  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" flex={1} bgcolor="background.default" p={2}>
        <Typography color="text.primary">Carregando...</Typography>
      </Stack>
    );
  }

  if (groupedPullRequests.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" flex={1} bgcolor="background.default" p={2}>
        <Typography color="text.primary">Nenhum PR aberto encontrado.</Typography>
      </Stack>
    );
  }

  return (
    <Stack borderRadius={2} padding={2} flex={1} >
      {groupedPullRequests.map((group) => (
        <Stack mb={4}>
          <Typography fontSize={'1.2rem'} children={group.repo} my={2} />
          <Stack width={'100%'} key={group.repo} display={'flex'} flexDirection={'row'} gap={1} flexWrap={'wrap'}>
            {group.prs.map((prs) => (
              <Box key={group.repo} sx={{ width: { xs: "100%", sm: 300, md: 'auto' } }} >
                <a href={prs.prUrl} target="_blank" rel="noreferrer">
                  <CardItem
                    title={prs.title}
                    autor={prs.owner}
                    totalChanges={prs.comments}
                    categories={['Bug']}
                    problemType="error"
                    daysOpen={prs.daysOpen}
                    approved={prs.approved}
                    resolvedChanges={prs.resolvedComments} />
                </a>
              </Box>
            ))}
          </Stack>
        </Stack>
      ))
      }
    </Stack >
  );
}
