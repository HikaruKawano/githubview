import { useState, useMemo } from 'react';
import { 
  Box, Stack, Typography, TextField, Button, Chip,
  Select, MenuItem, Autocomplete 
} from '@mui/material';
import { FilterAlt, Close, ExpandMore } from '@mui/icons-material';
import { Filters } from './types';

interface AdvancedFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  allRepos: string[];
  allOwners: string[];
  allReviewers: string[];
}

export const AdvancedFilters = ({
  filters,
  setFilters,
  allRepos,
  allOwners,
  allReviewers
}: AdvancedFiltersProps) => {
  const [expanded, setExpanded] = useState(false);
  const [ownerSearchInput, setOwnerSearchInput] = useState('');
  const [reviewerSearchInput, setReviewerSearchInput] = useState('');

  const selectedOwners = useMemo(() => {
    return filters.owner 
      ? (Array.isArray(filters.owner) ? filters.owner : [filters.owner]) 
      : [];
  }, [filters.owner]);

  const filteredOwners = useMemo(() => {
    return allOwners.filter(owner =>
      owner.toLowerCase().includes(ownerSearchInput.toLowerCase())
    );
  }, [allOwners, ownerSearchInput]);

  const filteredReviewers = useMemo(() => {
    return allReviewers.filter(reviewer =>
      reviewer.toLowerCase().includes(reviewerSearchInput.toLowerCase())
    );
  }, [allReviewers, reviewerSearchInput]);

  const activeFilters = useMemo(() => {
    const active: { type: string, value: string }[] = [];
    
    if (filters.repoName) {
      active.push({ type: 'repo', value: `Repositório: ${filters.repoName}` });
    }
    
    if (selectedOwners.length > 0) {
      active.push({ type: 'owner', value: `Donos: ${selectedOwners.join(', ')}` });
    }
    
    if (filters.approved !== 'all') {
      active.push({ type: 'approved', value: `Aprovação: ${filters.approved === 'approved' ? 'Aprovados' : 'Não Aprovados'}` });
    }
    
    if (Array.isArray(filters.reviwer) && filters.reviwer.length > 0) {
      active.push({
        type: 'reviewers',
        value: `Revisores: ${filters.reviwer.join(', ')}`
      });
    }

    return active;
  }, [filters, selectedOwners]);

  const resetFilters = () => {
    setFilters({
      repoName: '',
      owner: '',
      approved: 'all',
      reviwer: [] 
    });
  };

  const removeFilter = (type: string) => {
    switch(type) {
      case 'repo':
        setFilters({...filters, repoName: ''});
        break;
      case 'owner':
        setFilters({...filters, owner: ''});
        break;
      case 'approved':
        setFilters({...filters, approved: 'all'});
        break;
      case 'reviewers':
        setFilters({...filters, reviwer: []});
        break;
    }
  };

  const handleOwnersChange = (_: any, newValue: string[]) => {
    setFilters({
      ...filters,
      owner: newValue
    });
  };

  return (
    <Box sx={{ 
      mb: 3,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      p: 2,
      bgcolor: 'background.paper',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Box 
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          mb: expanded ? 2 : 0
        }}
      >
        <Box display="flex" alignItems="center" gap={1} sx={{ overflowX: 'auto', flex: 1, mr: 2 }}>
          <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
            <FilterAlt fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>
              Filtros
            </Typography>
          </Box>
          
          {activeFilters.length > 0 && (
            <Box display="flex" gap={1} ml={2} sx={{ flex: 1, minWidth: 0 }}>
              {activeFilters.map((filter, index) => (
                <Chip
                  key={index}
                  label={filter.value}
                  size="small"
                  onDelete={() => removeFilter(filter.type)}
                  deleteIcon={<Close fontSize="small" />}
                  sx={{
                    flexShrink: 0,
                    borderRadius: '6px',
                    bgcolor: 'action.selected',
                    '& .MuiChip-deleteIcon': {
                      color: 'text.secondary'
                    }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
        
        <ExpandMore sx={{ 
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          flexShrink: 0
        }} />
      </Box>

      {expanded && (
        <Box sx={{ mt: 2 }}>
          <Stack gap={2}>
            <Box>
              <Typography variant="body2" fontWeight={600} mb={1}>
                Repositório
              </Typography>
              <Autocomplete
                options={allRepos}
                value={filters.repoName}
                onChange={(_, newValue) => setFilters({ ...filters, repoName: newValue || '' })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    fullWidth
                    placeholder="Buscar repositório..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: 'background.paper'
                      }
                    }}
                  />
                )}
                freeSolo
              />
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={600} mb={1}>
                Dono do PR
              </Typography>
              <Autocomplete
                multiple
                options={filteredOwners}
                value={selectedOwners}
                onChange={handleOwnersChange}
                onInputChange={(_, newInputValue) => setOwnerSearchInput(newInputValue)}
                inputValue={ownerSearchInput}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    fullWidth
                    placeholder="Buscar donos..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: 'background.paper'
                      }
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={index}
                      label={option}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))
                }
              />
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={600} mb={1}>
                Status de Aprovação
              </Typography>
              <Select
                value={filters.approved}
                onChange={(e) => setFilters({
                  ...filters,
                  approved: e.target.value as 'all' | 'approved' | 'not-approved'
                })}
                fullWidth
                size="small"
                sx={{
                  borderRadius: '8px',
                  '& .MuiSelect-select': {
                    py: 1
                  }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="approved">Aprovados</MenuItem>
                <MenuItem value="not-approved">Não Aprovados</MenuItem>
              </Select>
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={600} mb={1}>
                Revisores
              </Typography>
              <Autocomplete
                multiple
                options={filteredReviewers}
                value={filters.reviwer}
                onChange={(_, newValue) => setFilters({ ...filters, reviwer: newValue })}
                onInputChange={(_, newInputValue) => setReviewerSearchInput(newInputValue)}
                inputValue={reviewerSearchInput}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    fullWidth
                    placeholder="Buscar revisores..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: 'background.paper'
                      }
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={index}
                      label={option}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))
                }
              />
            </Box>

            <Box display="flex" justifyContent="flex-end">
              <Button
                size="small"
                onClick={resetFilters}
                startIcon={<Close />}
                sx={{
                  textTransform: 'none',
                  color: 'text.secondary'
                }}
              >
                Limpar todos os filtros
              </Button>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
};