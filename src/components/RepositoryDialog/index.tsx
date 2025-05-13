import { CloseRounded } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography, Checkbox, Card as MuiCard } from '@mui/material';

interface RepositoryDialogProps {
  open: boolean;
  onClose: () => void;
  repos: {name: string; pulls_url: string}[];
}

export function RepositoryDialog({ open, onClose, repos }: RepositoryDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        Repositórios
        <IconButton onClick={onClose}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {repos.map((repo) => (
          <MuiCard key={repo.name} sx={{ marginBottom: 2, padding: 1, borderRadius: 3, boxShadow: 1 }}>
            <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">{repo.name}</Typography>
              <Checkbox inputProps={{ 'aria-label': 'controlled' }} />
            </Stack>
          </MuiCard>
        ))}
      </DialogContent>
    </Dialog>
  );
}
