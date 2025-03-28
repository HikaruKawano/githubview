import { useEffect } from 'react';
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
      resolvedComments: number;
    }>;
  }>;
  loading: boolean;
  onCardsReady?: () => void;
}

const categorizePR = (title: string) => {
  // Categorias com palavras-chave em inglês, português e termos técnicos
  const categories = [
    { keys: ['FEAT', 'NOVO', 'ADICIONA'], label: 'Nova Funcionalidade' },
    { keys: ['REP'], label: 'Nova Funcionalidade' },
    { keys: ['FIX', 'CORRIGE', 'CORRECAO'], label: 'Correção de Bug' },
    { keys: ['HOTFIX', 'URGENTE'], label: 'Correção Urgente' },
    { keys: ['DOCS', 'DOCUMENTACAO'], label: 'Documentação' },
    { keys: ['BUILD', 'COMPILA', 'COMPILACAO'], label: 'Build/Dependências' },
    { keys: ['PERF', 'MELHORA', 'OTIMIZA'], label: 'Melhoria de Performance' },
    { keys: ['STYLE', 'ESTILO', 'FORMATACAO'], label: 'Estilo/Formatação' },
    { keys: ['REFACT', 'REFATORA', 'REFATORACAO'], label: 'Refatoração' },
    { keys: ['CHORE', 'MANUTENCAO', 'ADMINISTRATIVO'], label: 'Tarefas Administrativas' },
    { keys: ['CI', 'INTEGRACAO'], label: 'Integração Contínua' },
    { keys: ['RAW', 'CONFIG', 'CONFIGURACAO', 'DADOS'], label: 'Configurações/Dados' },
    { keys: ['TEST', 'TESTE', 'TESTES'], label: 'Testes' },
    { keys: ['WIP', 'EM ANDAMENTO'], label: 'Em Andamento' },
    { keys: ['REVERT', 'REVERSAO', 'DESFAZER'], label: 'Reversão' },
    { keys: ['ENHANCE', 'APERFEICOAMENTO', 'APERFEIÇOAMENTO'], label: 'Aperfeiçoamento' },
    { keys: ['SECURITY', 'SEGURANCA'], label: 'Segurança' },
    { keys: ['INFRA', 'DEPLOY', 'ROLLBACK', 'MIGRA', 'MIGRATION', 'SETUP', 'DOCKER', 'KUBERNETES', 'SERVIDOR'], label: 'Infraestrutura/Deploy' },
  ];

  const upperTitle = title.toUpperCase();
  const category = categories.find((c) =>
    c.keys.some((key) => upperTitle.includes(key))
  );
  return category ? category.label : 'Outros';
};

const getProblemType = (categoryLabel: string) => {
  switch (categoryLabel) {
    case 'Nova Funcionalidade':
      return 'new';
    case 'Correção de Bug':
      return 'error';
    case 'Correção Urgente':
      return 'warning';
    case 'Documentação':
      return 'info';
    case 'Build/Dependências':
      return 'warning';
    case 'Melhoria de Performance':
      return 'warning';
    case 'Estilo/Formatação':
      return 'info';
    case 'Refatoração':
      return 'info';
    case 'Tarefas Administrativas':
      return 'info';
    case 'Integração Contínua':
      return 'info';
    case 'Configurações/Dados':
      return 'info';
    case 'Testes':
      return 'info';
    case 'Em Andamento':
      return 'warning';
    case 'Reversão':
      return 'warning';
    case 'Aperfeiçoamento':
      return 'info';
    case 'Segurança':
      return 'error';
    case 'Infraestrutura/Deploy':
      return 'warning';
    default:
      return 'default';
  }
};

export function RepositoryList({ groupedPullRequests, loading, onCardsReady }: RepositoryListProps) {
  useEffect(() => {
    if (!loading && groupedPullRequests.length > 0 && onCardsReady) {
      onCardsReady();
    }
  }, [loading, groupedPullRequests, onCardsReady]);

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
    <Stack borderRadius={2} padding={2} flex={1}>
      {groupedPullRequests.map((group) => (
        <Stack key={group.repo} mb={4}>
          <Typography fontSize={'1.2rem'} children={group.repo} my={2} />
          <Stack width={'100%'} display={'flex'} flexDirection={'row'} gap={2} flexWrap={'wrap'}>
            {group.prs.map((prs) => {
              const category = categorizePR(prs.title);
              return (
                <Box key={prs.id} sx={{ width: { xs: '100%', sm: 300, md: 'auto' } }}>
                  <a href={prs.prUrl} target="_blank" rel="noreferrer">
                    <CardItem
                      title={prs.title}
                      autor={prs.owner}
                      totalChanges={prs.comments}
                      categories={[category]}
                      problemType={getProblemType(category)}
                      daysOpen={prs.daysOpen}
                      approved={prs.approved}
                      resolvedChanges={prs.resolvedComments}
                    />
                  </a>
                </Box>
              );
            })}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
