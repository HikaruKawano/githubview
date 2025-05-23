import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

interface QuickFilterBarProps {
  onSearchChange: (value: string) => void;
}

export const QuickFilterBar = ({ onSearchChange }: QuickFilterBarProps) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Buscar por título do PR..."
      onChange={(e) => onSearchChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search color="action" />
          </InputAdornment>
        ),
        sx: {
          borderRadius: '8px',
          backgroundColor: 'background.paper'
        }
      }}
      sx={{ mb: 2 }}
    />
  );
};