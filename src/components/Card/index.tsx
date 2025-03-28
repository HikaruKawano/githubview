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
  CreateRounded
} from "@mui/icons-material";
import {
  Box,
  Chip,
  Typography,
  Stack,
  useTheme,
  LinearProgress,
  Tooltip
} from "@mui/material";

interface CardItemProps {
  title: string;
  autor?: string;
  categories: string[];
  problemType: string;
  totalChanges: number;
  resolvedChanges: number;
  daysOpen: number;
  approved?: boolean;
}

const CardItem: React.FC<CardItemProps> = ({
  title,
  autor,
  totalChanges,
  resolvedChanges,
  daysOpen,
  approved = false,
  problemType,
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

  return (
    <Box
      p={3}
      borderRadius={4}
      sx={{
        transition: "transform 0.2s ease",
        "&:hover": { transform: "translateY(-5px)" },
        width: { xs: "100%", sm: 350, md: 400 },
        height: 300,
        border: approved ? `2px solid ${theme.palette.success.main}` : '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(45deg, rgba(32, 32, 32, 0.9) 30%, rgba(40, 40, 40, 0.9) 90%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {approved && (
        <Chip
          label="Aprovado"
          icon={<DoneAll />}
          size="small"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            background: theme.palette.success.main,
            color: theme.palette.common.white,
            border: `1px solid ${theme.palette.success.dark}`,
            fontWeight: 600,
            zIndex: 1,
            '& .MuiChip-icon': {
              color: theme.palette.common.white
            }
          }}
        />
      )}

      <Stack spacing={2}>
        <Chip
          icon={typeIcon}
          label={problemType}
          size="small"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            color: theme.palette.text.primary,
            border: '1px solid rgba(255, 255, 255, 0.23)',
            "& .MuiChip-icon": { 
              color: typeColor,
              marginLeft: '8px'
            },
            alignSelf: 'flex-start'
          }}
        />

        <Typography 
          variant="h6" 
          fontWeight={700}
          sx={{
            color: theme.palette.common.white,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {title}
        </Typography>

        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontStyle: 'italic',
            lineHeight: 1.4
          }}
        >
          {autor || "Autor desconhecido"}
        </Typography>

        {totalChanges > 0 && (
          <Box mt={1}>
            <Tooltip title={`${resolvedChanges}/${totalChanges} alterações resolvidas`}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.success.main,
                  },
                }}
              />
            </Tooltip>

            {resolvedChanges === totalChanges ? (
              <Chip
                icon={<CheckCircle />}
                label="Concluído"
                size="small"
                sx={{
                  bgcolor: theme.palette.success.light + '22',
                  color: theme.palette.success.main,
                  mt: 2,
                  border: `1px solid ${theme.palette.success.light}`,
                  '& .MuiChip-icon': { 
                    color: theme.palette.success.main,
                    fontSize: 18
                  }
                }}
              />
            ) : (
              <Stack direction="row" alignItems="center" mt={2} spacing={1}>
                <Comment fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {resolvedChanges}/{totalChanges} resolvidos
                </Typography>
              </Stack>
            )}
          </Box>
        )}
      </Stack>

      <Typography 
        variant="caption" 
        sx={{ 
          color: 'rgba(255, 255, 255, 0.5)',
          display: 'block',
          mt: 2
        }}
      >
        {daysOpen > 0 ? `Aberto há ${daysOpen} dia(s)` : "Aberto hoje"}
      </Typography>
    </Box>
  );
};

export default CardItem;