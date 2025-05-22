'use client';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ThemeProvider, Box, Stack, Avatar, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails,
  Typography, TextField, Button, Chip, Divider,
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
  Autocomplete,
  Checkbox,
  ListItemText,
  type SelectChangeEvent
} from '@mui/material';
import { RepositoryList } from '../components/RepositoryList';
import { Person, ExpandMore, FilterAlt, Close, Search, Inbox } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { io, Socket } from 'socket.io-client';
import { CreateOctokit } from '@/services/github/octokit';
import { GetUserData } from '@/services/github/userService';
import { GetRepos } from '@/services/github/repoService';
import { FetchOpenPullRequestsByOwner, FetchSinglePullRequest } from '@/services/github/pullRequestService';
import { SessionProvider, useSession } from 'next-auth/react';
import theme from '@/services/theme';

interface PullRequest {
  id: number;
  title: string;
  url: string;
  state: string;
  owner: string;
  prUrl: string;
  approved: boolean;
  comments: number;
  resolvedComments: number;
  createdAt: string;
  daysOpen: number;
  reviwer: reviwer[]; // Added reviewer property to match RepositoryList expectations
}

interface reviwer {
  name: string;
  avatarUrl: string;
}

interface RepoPRsGroup {
  repo: string;
  prs: PullRequest[];
}

interface Filters {
  repoName: string;
  owner: string | string[];
  approved: 'all' | 'approved' | 'not-approved';
  reviewers: string[];
}

const AdvancedFilters = ({ 
  filters, 
  setFilters,
  allRepos,
  allOwners,
  allReviewers
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  allRepos: string[];
  allOwners: string[];
  allReviewers: string[];
}) => {
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
    const active: {type: string, value: string}[] = [];
    
    if (filters.repoName) {
      active.push({type: 'repo', value: `Repositório: ${filters.repoName}`});
    }
    
    if (selectedOwners.length > 0) {
      active.push({type: 'owner', value: `Donos: ${selectedOwners.join(', ')}`});
    }
    
    if (filters.approved !== 'all') {
      active.push({type: 'approved', value: `Aprovação: ${filters.approved === 'approved' ? 'Aprovados' : 'Não Aprovados'}`});
    }
    
    if (filters.reviewers.length > 0) {
      active.push({type: 'reviewers', value: `Revisores: ${filters.reviewers.join(', ')}`});
    }
    
    return active;
  }, [filters, selectedOwners]);

  const resetFilters = () => {
    setFilters({
      repoName: '',
      owner: '',
      approved: 'all',
      reviewers: []
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
        setFilters({...filters, reviewers: []});
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
            {/* Filtro de Repositório */}
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

            {/* Filtro de Donos */}
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

            {/* Filtro de Status de Aprovação */}
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

            {/* Filtro de Revisores */}
            <Box>
              <Typography variant="body2" fontWeight={600} mb={1}>
                Revisores
              </Typography>
              <Autocomplete
                multiple
                options={filteredReviewers}
                value={filters.reviewers}
                onChange={(_, newValue) => setFilters({ ...filters, reviewers: newValue })}
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

            {/* Botão Limpar Todos */}
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
const QuickFilterBar = ({ onSearchChange }: {
  onSearchChange: (value: string) => void;
}) => {
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

const EmptyState = ({ hasFilters, onReset }: {
  hasFilters: boolean;
  onReset: () => void;
}) => {
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

const filterPRs = {
  byRepo: (data: RepoPRsGroup[], repoName: string): RepoPRsGroup[] => {
    if (!repoName) return data;
    return data.filter(group =>
      group.repo.toLowerCase().includes(repoName.toLowerCase())
    );
  },

  byOwner: (data: RepoPRsGroup[], owner: string | string[]): RepoPRsGroup[] => {
    if (!owner || (Array.isArray(owner) && owner.length === 0)) return data;

    const ownersArray = Array.isArray(owner) ? owner : [owner];

    return data.map(group => ({
      ...group,
      prs: group.prs.filter(pr =>
        ownersArray.some(o =>
          pr.owner.toLowerCase().includes(o.toLowerCase())
        )
      )
    })).filter(group => group.prs.length > 0);
  },

  byApproval: (data: RepoPRsGroup[], approved: 'all' | 'approved' | 'not-approved'): RepoPRsGroup[] => {
    if (approved === 'all') return data;
    return data.map(group => ({
      ...group,
      prs: group.prs.filter(pr =>
        approved === 'approved' ? pr.approved : !pr.approved
      )
    })).filter(group => group.prs.length > 0);
  },

  byReviewers: (data: RepoPRsGroup[], reviewers: string[]): RepoPRsGroup[] => {
    if (!reviewers || reviewers.length === 0) return data;

    return data.map(group => ({
      ...group,
      prs: group.prs.filter(pr =>
        pr.reviwer?.some(r =>
          reviewers.some(filterReviewer =>
            r.name.toLowerCase().includes(filterReviewer.toLowerCase())
          )
        )
      )
    })).filter(group => group.prs.length > 0);
  },

  combine: (data: RepoPRsGroup[], filters: Filters): RepoPRsGroup[] => {
    let result = [...data];
    result = filterPRs.byApproval(result, filters.approved);
    result = filterPRs.byRepo(result, filters.repoName);
    result = filterPRs.byOwner(result, filters.owner);
    result = filterPRs.byReviewers(result, filters.reviewers);
    return result;
  }
};

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [reposData, setReposData] = useState<{ name: string; pulls_url: string }[]>([]);
  const [prsData, setPrsData] = useState<RepoPRsGroup[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(false);
  const [loadingPrIds, setLoadingPrIds] = useState<number[]>([]);
  const [owner, setOwner] = useState<string | undefined>(session?.user?.githubOwner);
  const [token, setToken] = useState<string | undefined>(session?.user?.token);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    repoName: '',
    owner: '',
    approved: 'all',
    reviewers: []
  });
  const router = useRouter();

  const allRepos = useMemo(() => {
    const repos = new Set<string>();
    prsData.forEach(group => repos.add(group.repo));
    return Array.from(repos).sort();
  }, [prsData]);

  const allOwners = useMemo(() => {
    const owners = new Set<string>();
    prsData.forEach(group => {
      group.prs.forEach(pr => owners.add(pr.owner));
    });
    return Array.from(owners).sort();
  }, [prsData]);

  const allReviewers = useMemo(() => {
    const reviewers = new Set<string>();
    prsData.forEach(group => {
      group.prs.forEach(pr => {
        pr.reviwer?.forEach(r => reviewers.add(r.name));
      });
    });
    return Array.from(reviewers).sort();
  }, [prsData]);

  const handleUpdatePullRequest = useCallback(async (data: any) => {
    if (!token || !owner) return;

    try {
      const octokit = CreateOctokit(token);
      const repoName = data.repository?.name;
      const prId = data.pull_request?.id;
      const prNumber = data.pull_request?.number;
      const url = data.pull_request?.url;

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

      const freshPrData = await FetchSinglePullRequest(octokit, { name: repoName, pulls_url: url }, prNumber);
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
  }, [token, owner]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      setToken(session?.user.token);
      setOwner(session?.user.githubOwner);
    }
  }, [status, router, session]);

  useEffect(() => {
    if (!token || !owner) return;

    const socket: Socket = io({ path: '/api/socket' });
    socket.on('new-webhook-event', handleUpdatePullRequest);
    return () => { socket.disconnect(); };
  }, [token, owner, handleUpdatePullRequest]);

  useEffect(() => {
    if (!token || !owner) return;
    const loadData = async () => {
      try {
        const octokit = CreateOctokit(token);
        const repos = await GetRepos(octokit);
        const prsPromises = await FetchOpenPullRequestsByOwner(octokit);
        const prsResults = (await Promise.all(prsPromises))
          .filter((result): result is RepoPRsGroup => result !== null);
        const user = await GetUserData(octokit, owner);

        setReposData(repos);
        setPrsData(prsResults); filteredPrsData
        setUserData(user);
        setLoading(false);
      } catch (error) {
        Swal.fire('Erro', 'Token ou usuário inválido', 'error');
        router.push('/login');
      }
    };

    loadData();
  }, [token, owner, router]);

  const filteredPrsData = useMemo(() => {
    let result = filterPRs.combine(prsData, filters);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.map(group => ({
        ...group,
        prs: group.prs.filter(pr =>
          group.repo.toLowerCase().includes(query) ||
          pr.title.toLowerCase().includes(query) ||
          pr.owner.toLowerCase().includes(query)
        )
      })).filter(group => group.prs.length > 0);
    }

    return result;
  }, [prsData, filters, searchQuery]);

  const resetFilters = () => {
    setFilters({
      repoName: '',
      owner: '',
      approved: 'all',
      reviewers: []
    });
    setSearchQuery('');
  };

  const hasActiveFilters = useMemo(() => {
    return filters.repoName !== '' || filters.owner !== '' || filters.approved !== 'all' || filters.reviewers.length > 0 || searchQuery !== '';
  }, [filters, searchQuery]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3, width: '100%', maxWidth: 1440 }}>
          {userData?.avatarUrl ? (
            <Avatar src={userData.avatarUrl} sx={{ width: 48, height: 48 }} />
          ) : (
            <Person sx={{ width: 48, height: 48 }} />
          )}
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, width: '100%' }}>
            <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.success.main }} />
          </Box>
        ) : (
          <Box sx={{ width: '100%', maxWidth: 1440 }}>
            <QuickFilterBar onSearchChange={setSearchQuery} />
            <AdvancedFilters
              filters={filters}
              setFilters={setFilters}
              allRepos={allRepos}
              allOwners={allOwners}
              allReviewers={allReviewers}
            />

            {filteredPrsData.length === 0 ? (
              <EmptyState
                hasFilters={hasActiveFilters}
                onReset={resetFilters}
              />
            ) : (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(380px, 1fr))' },
                gap: 3
              }}>
                <RepositoryList
                  groupedPullRequests={filteredPrsData}
                  loading={cardLoading}
                  loadingPrIds={loadingPrIds}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

const DashboardWithSession = () => {
  return (
    <SessionProvider>
      <Dashboard />
    </SessionProvider>
  );
};

export default DashboardWithSession;