import React from "react";
import {
  BugReport,
  Comment,
  Add,
  Edit,
  QuestionAnswer,
  CheckCircle,
  DoneAll
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
  categories,
  autor,
  totalChanges,
  resolvedChanges,
  daysOpen,
  approved = false,
  problemType,
}) => {
  const theme = useTheme();

  // Ícone e cor para o tipo do card
  const getProblemTypeIcon = () => {
    switch (problemType.toLowerCase()) {
      case "feature":
        return { icon: <Add />, color: theme.palette.success.main };
      case "bug":
        return { icon: <BugReport />, color: theme.palette.error.main };
      case "refactor":
        return { icon: <Edit />, color: theme.palette.warning.main };
      default:
        return { icon: <QuestionAnswer />, color: theme.palette.info.main };
    }
  };

  const { icon: typeIcon, color: typeColor } = getProblemTypeIcon();

  // Cálculo do progresso das alterações resolvidas
  const progress = totalChanges > 0
    ? Math.round((resolvedChanges / totalChanges) * 100)
    : 0;

  return (
    <Box
      bgcolor={theme.palette.background.paper}
      p={3}
      borderRadius={4}
      boxShadow={3}
      sx={{
        transition: "transform 0.2s ease",
        "&:hover": { transform: "translateY(-5px)" },
        width: { xs: "100%", sm: 350, md: 400 },
        minHeight: 230,
        border: approved ? `2px solid ${theme.palette.success.main}` : "none",
        position: "relative"
      }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      {/* Chip indicando que está aprovado, caso esteja */}
      {approved && (
        <Chip
          label="Aprovado"
          icon={<DoneAll />}
          size="small"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: theme.palette.success.light,
            color: theme.palette.success.contrastText
          }}
        />
      )}

      <Stack spacing={1}>
        {/* Linha do "tipo" do card */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={typeIcon}
            label={problemType}
            size="small"
            sx={{
              bgcolor: theme.palette.grey[800],
              color: theme.palette.common.white,
              border: `1px solid ${theme.palette.grey[400]}`,
              "& .MuiChip-icon": {
                color: typeColor
              }
            }}
          />

          {/* Categorias (cada uma com seu Chip) */}
          {categories.map((category, index) => (
            <Chip
              key={index}
              label={category}
              size="small"
              sx={{
                bgcolor: theme.palette.grey[700],
                color: theme.palette.common.white,
                border: `1px solid ${theme.palette.grey[500]}`,
              }}
            />
          ))}
        </Stack>

        {/* Título do card */}
        <Typography
          variant="h6"
          color={theme.palette.text.primary}
          fontWeight="bold"
          sx={{
            mt: 1,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap"
          }}
        >
          {title}
        </Typography>

        {/* Autor */}
        <Typography
          variant="body2"
          sx={{ color: theme.palette.grey[400], fontStyle: "italic" }}
        >
          {autor || "Autor desconhecido"}
        </Typography>

        {totalChanges > 0 && (
          <Box mt={1}>
            <Tooltip
              title={`${resolvedChanges} de ${totalChanges} alterações resolvidas`}
            >
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Tooltip>

            {resolvedChanges === totalChanges ? (
              <Chip
                icon={<CheckCircle sx={{ color: theme.palette.success.dark }} />}
                label="Todas as alterações resolvidas"
                size="small"
                sx={{
                  bgcolor: theme.palette.success.light,
                  color: theme.palette.success.contrastText,
                  mt: 1,
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <Comment sx={{ fontSize: 20, color: theme.palette.grey[400], marginRight: 1}} />
                {resolvedChanges} de {totalChanges} alterações resolvidas
              </Typography>
            )}
          </Box>
        )}
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" mt={2}>
        <Box
          sx={{
            ml: "auto",
            fontSize: "0.85rem",
            color: theme.palette.grey[500]
          }}
        >
          {daysOpen > 0 ? `Aberto há ${daysOpen} dia(s)` : "Aberto hoje"}
        </Box>
      </Stack>
    </Box>
  );
};

export default CardItem;
