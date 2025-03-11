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
      comments: number;
    }>;
  }>;
  loading: boolean;
}

export function RepositoryList({ groupedPullRequests, loading }: RepositoryListProps) {
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
    <Stack bgcolor="background.default" borderRadius={2} padding={2} flex={1} overflow="auto" maxHeight="85vh" boxShadow={3}>
      {groupedPullRequests.map((group) => (
        <Stack>
          <Typography fontSize={'1.2rem'} children={group.repo} mt={4} />
          {group.prs.map((prs) => (
            <Box key={group.repo}>
              <CardItem title={prs.title} autor={prs.owner} changes={prs.comments} categories={['Bug']} problemType="error" />
            </Box>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
