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
      bgcolor="rgba(255, 255, 255, 0.05)"
      p={3}
      borderRadius={4}
      sx={{
        transition: "transform 0.2s ease",
        "&:hover": { transform: "translateY(-5px)" },
        width: { xs: "100%", sm: 350, md: 400 },
        height: 300,
        border: approved ? `2px solid ${theme.palette.success.main}` : '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: theme.shadows[2],
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
          icon={<DoneAll sx={{ color: theme.palette.success.contrastText }} />}
          size="small"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: theme.palette.success.main,
            color: theme.palette.success.contrastText,
            border: `1px solid ${theme.palette.success.dark}`,
            fontSize: '0.75rem',
            fontWeight: 600,
            zIndex: 1,
            '& .MuiChip-label': { paddingRight: '6px' }
          }}
        />
      )}

      <Stack spacing={1.5}>
        <Chip
          icon={typeIcon}
          label={problemType}
          size="small"
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            "& .MuiChip-icon": { color: typeColor }
          }}
        />

        <Typography 
          variant="h6" 
          fontWeight={600} 
          color="text.primary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary" fontStyle="italic">
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
                  backgroundColor: theme.palette.divider,
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
                  bgcolor: theme.palette.success.main + '22',
                  color: theme.palette.success.main,
                  mt: 1.5,
                  '& .MuiChip-icon': { fontSize: 18 }
                }}
              />
            ) : (
              <Stack direction="row" alignItems="center" mt={1.5} spacing={0.5}>
                <Comment fontSize="small" color="disabled" />
                <Typography variant="body2" color="text.secondary">
                  {resolvedChanges}/{totalChanges} resolvidos
                </Typography>
              </Stack>
            )}
          </Box>
        )}
      </Stack>

      <Typography variant="caption" color="text.disabled" mt={2} display="block">
        {daysOpen > 0 ? `Aberto há ${daysOpen} dia(s)` : "Aberto hoje"}
      </Typography>
    </Box>
  );
};

export default CardItem;