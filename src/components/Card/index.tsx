import React from "react";
import {
  BugReport,
  Comment,
  Add,
  Edit,
  CheckCircle,
  DoneAll,
  Build,
  DocumentScanner,
  FlashOn,
  Security,
  Settings,
  CreateRounded,
  Person,
  AccessTime,
  ArrowUpward,
  PeopleAlt,
  VerifiedUser
} from "@mui/icons-material";
import {
  Box,
  Chip,
  Typography,
  Stack,
  useTheme,
  LinearProgress,
  Tooltip,
  Avatar,
  AvatarGroup,
  IconButton,
  Divider
} from "@mui/material";

interface Reviwer {
  name: string;
  avatarUrl?: string;
}

interface CardItemProps {
  title: string;
  autor?: string;
  categories: string[];
  problemType: string;
  totalChanges: number;
  resolvedChanges: number;
  daysOpen: number;
  approved?: boolean;
  reviwer?: Reviwer[];
}

const CardItem: React.FC<CardItemProps> = ({
  title,
  autor,
  totalChanges,
  resolvedChanges,
  daysOpen,
  approved = false,
  problemType,
  reviwer = [],
}) => {
  const theme = useTheme();

  const getProblemTypeIcon = () => {
    switch (problemType.toLowerCase()) {
      case "new":
        return { icon: <CreateRounded />, color: theme.palette.success.main };
      case "error":
        return { icon: <BugReport />, color: theme.palette.error.main };
      case "warning":
        return { icon: <Edit />, color: theme.palette.warning.main };
      case "nova funcionalidade":
        return { icon: <Add />, color: theme.palette.success.main };
      case "correção de bug":
        return { icon: <BugReport />, color: theme.palette.error.main };
      case "documentação":
        return { icon: <DocumentScanner />, color: theme.palette.info.main };
      case "build/dependências":
        return { icon: <Build />, color: theme.palette.info.main };
      case "melhoria de performance":
        return { icon: <FlashOn />, color: theme.palette.success.main };
      case "estilo/formatação":
        return { icon: <Edit />, color: theme.palette.warning.main };
      case "tarefas administrativas":
        return { icon: <Settings />, color: theme.palette.info.main };
      case "segurança":
        return { icon: <Security />, color: theme.palette.error.main };
      default:
        return { icon: <CheckCircle />, color: theme.palette.info.main };
    }
  };

  const { icon: typeIcon, color: typeColor } = getProblemTypeIcon();
  const progress = totalChanges > 0
    ? Math.round((resolvedChanges / totalChanges) * 100)
    : 0;

  const getInitial = (name?: string) => {
    return name?.charAt(0)?.toUpperCase() || '?';
  };

  return (
    <Box
      p={3}
      borderRadius={4}
      sx={{
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": { 
          transform: "translateY(-5px)",
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)'
        },
        width: { xs: "100%", sm: 400, md: 420 },
        minHeight: 320,
        border: approved 
          ? `2px solid ${theme.palette.success.main}` 
          : '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(135deg, rgba(32, 32, 32, 0.95) 0%, rgba(40, 40, 40, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "visible",
      }}
    >
      {approved && (
        <Chip
          label="Aprovado"
          icon={<VerifiedUser fontSize="small" />}
          size="small"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            background: theme.palette.success.dark,
            color: theme.palette.common.white,
            fontWeight: 600,
            zIndex: 1,
            '& .MuiChip-icon': {
              color: theme.palette.common.white,
              marginLeft: '4px'
            }
          }}
        />
      )}

      {/* Improved Reviewer Section */}
      <Box sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1
      }}>
        <Typography 
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontWeight: 500
          }}
        >
          <PeopleAlt fontSize="small" />
          Revisores:
        </Typography>
        
        {reviwer.length > 0 ? (
          <AvatarGroup 
            max={3}
            sx={{ 
              '& .MuiAvatar-root': { 
                width: 34, 
                height: 34,
                border: `2px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                  zIndex: 2
                },
                transition: 'all 0.2s ease'
              }
            }}
          >
            {reviwer.map((user, index) => (
              <Tooltip 
                key={index} 
                title={user.name || 'Revisor'} 
                arrow
                placement="right"
                PopperProps={{
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, 10],
                      },
                    },
                  ],
                }}
              >
                <Avatar 
                  src={user.avatarUrl}
                  alt={user.name || 'Revisor'}
                  sx={{
                    bgcolor: theme.palette.primary.dark,
                    '&:hover': {
                      bgcolor: theme.palette.primary.main
                    }
                  }}
                >
                  {getInitial(user.name)}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        ) : (
          <Chip
            label="Não atribuído"
            size="small"
            variant="outlined"
            icon={<Person fontSize="small" />}
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              fontSize: '0.75rem'
            }}
          />
        )}
      </Box>

      <Stack spacing={2} sx={{ mt: 8 }}>
        <Box>
          <Chip
            icon={typeIcon}
            label={problemType}
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: theme.palette.text.primary,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              "& .MuiChip-icon": { 
                color: typeColor,
                marginLeft: '8px',
                fontSize: '18px'
              },
              alignSelf: 'flex-start',
              mb: 1.5
            }}
          />

          <Tooltip title={title} placement="top" arrow>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{
                color: theme.palette.common.white,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
                minHeight: '3.5em',
                fontSize: '1.1rem'
              }}
            >
              {title}
            </Typography>
          </Tooltip>

          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontStyle: 'italic',
              lineHeight: 1.5,
              mt: 1
            }}
          >
            Por {autor || "Autor desconhecido"}
          </Typography>
        </Box>

        {totalChanges > 0 && (
          <Box mt={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Progresso
              </Typography>
              <Typography variant="caption" fontWeight={500} sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {progress}%
              </Typography>
            </Stack>
            
            <Tooltip title={`${resolvedChanges}/${totalChanges} alterações resolvidas`}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: progress === 100 
                      ? theme.palette.success.main 
                      : theme.palette.primary.main,
                  },
                }}
              />
            </Tooltip>
          </Box>
        )}
      </Stack>

      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ 
          borderColor: 'rgba(255, 255, 255, 0.08)', 
          my: 2 
        }} />
        
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTime fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.85rem'
              }}
            >
              {daysOpen > 0 ? `Aberto há ${daysOpen} dia(s)` : "Aberto hoje"}
            </Typography>
          </Stack>
          
          <Tooltip title="Ver detalhes">
            <IconButton size="small" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: theme.palette.primary.main,
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
            }}>
              <ArrowUpward fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
};

export default CardItem;