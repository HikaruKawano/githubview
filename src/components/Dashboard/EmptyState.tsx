import { Box, Typography, Button } from '@mui/material';
import { Inbox, Close } from '@mui/icons-material';
import theme from '@/services/theme';

interface EmptyStateProps {
  hasFilters: boolean;
  onReset: () => void;
}

export const EmptyState = ({ hasFilters, onReset }: EmptyStateProps) => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      textAlign: 'center',
      borderRadius: '12px',
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1]
    }}>
      <Inbox sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {hasFilters ? 'Nenhum PR encontrado com esses filtros' : 'Nenhum PR disponível'}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: '400px', mb: 2 }}>
        {hasFilters ? 'Tente ajustar seus critérios de filtro.' : 'Todos os PRs estão atualizados'}
      </Typography>
      {hasFilters && (
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={onReset}
          startIcon={<Close />}
        >
          Limpar filtros
        </Button>
      )}
    </Box>
  );
};