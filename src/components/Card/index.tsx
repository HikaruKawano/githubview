import React from "react";
import { BugReport, Comment, Add, Edit, QuestionAnswer, Label } from "@mui/icons-material";
import { Box, Chip, Typography, Stack, useTheme } from "@mui/material";

interface CardItemProps {
  title: string;
  autor: string | undefined;
  categories: string[];
  problemType: string;
  changes: number;
  daysOpen: number;
}

const CardItem: React.FC<CardItemProps> = ({ title, categories, autor, changes, daysOpen }) => {
  const theme = useTheme();

  const getTitleIcon = () => {
    const titleLowerCase = title.toLowerCase();
    if (/(feat|rep)/.test(titleLowerCase)) return { icon: <Add />, color: theme.palette.success.main, label: "Feature" };
    if (/(fix|bug|correção)/.test(titleLowerCase)) return { icon: <BugReport />, color: theme.palette.error.main, label: "Bug" };
    if (/refactor|refatoração/.test(titleLowerCase)) return { icon: <Edit />, color: theme.palette.warning.main, label: "Refactor" };
    return { icon: <QuestionAnswer />, color: theme.palette.info.main, label: "Discussion" };
  };

  const { icon: titleIcon, color: titleColor, label: titleLabel } = getTitleIcon();

  return (
    <Box
      bgcolor={theme.palette.background.paper}
      p={3}
      borderRadius={4}
      boxShadow={3}
      sx={{
        transition: "transform 0.2s ease",
        "&:hover": { transform: "translateY(-5px)" },
        minWidth: { xs: "100%", sm: 300, md: 400 },
        maxWidth: { xs: "100%", sm: 350, md: 400 },
      }}
    >
      <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
        {categories.map((category, index) => (
          <Chip
            key={index}
            label={titleLabel}
            icon={titleIcon}
            size="small"
            sx={{
              bgcolor: theme.palette.grey[800],
              color: theme.palette.common.white,
              border: `1px solid ${theme.palette.grey[400]}`,
              '& .MuiChip-icon': {
                color: titleColor
              }
            }}
          />
        ))}
      </Stack>

      <Typography variant="h6" color={theme.palette.text.primary} fontWeight="bold">
        {title}
      </Typography>

      <Box>
        <Typography variant="body2" component="span" sx={{ color: theme.palette.grey[400] }}>
          {autor || "Autor desconhecido"}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} alignItems="center" mt={1}>
        <Comment sx={{ fontSize: 20, color: theme.palette.grey[400] }} />
        <Typography variant="body2" color={theme.palette.grey[400]}>
          {changes} alterações
        </Typography>
        <Box sx={{ ml: "auto", fontSize: "0.85rem", color: theme.palette.grey[500] }}>
          ⏳ {daysOpen > 0 ? `Há ${daysOpen} dias aberto` : "Hoje"}
        </Box>
      </Stack>
    </Box>
  );
};

export default CardItem;
