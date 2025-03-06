import React from "react";
import { BugReport, QuestionAnswer, Comment } from "@mui/icons-material";
import { Box, Chip, Typography, Stack, useTheme } from "@mui/material";

interface CardItemProps {
  title: string;
  problem: string;
  categories: string[];
  problemType: string;
}

const CardItem: React.FC<CardItemProps> = ({ title, problem, categories, problemType }) => {
  const theme = useTheme(); // Usando o hook useTheme para acessar o tema

  // Determina o ícone da categoria
  const getCategoryIcon = (category: string) => {
    if (category === "Questões") return <QuestionAnswer sx={{ color: theme.palette.secondary.main }} />;
    if (category === "Bug") return <BugReport sx={{ color: theme.palette.error.main }} />;
    return undefined; // Retorna undefined ao invés de null
  };

  const problemLabel = problemType === "error" ? "Erro" : "Outro";
  const problemColor = problemType === "error" ? theme.palette.error.main : theme.palette.info.main;

  return (
    <Box bgcolor={theme.palette.grey[700]} p={2} my={2} borderRadius={2}>
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {categories.map((category, index) => (
          <Chip
            key={index}
            icon={getCategoryIcon(category)}
            label={category}
            size="small"
            sx={{
              bgcolor: theme.palette.grey[800],
              color: theme.palette.common.white,
              border: `1px solid ${theme.palette.grey[400]}`,
            }}
          />
        ))}
      </Stack>
      <Typography variant="h6" color="white" fontWeight="bold">
        {title}
      </Typography>
      <Box mt={1}>
        <Typography variant="body2" component="span" sx={{ color: problemColor, fontWeight: "bold" }}>
          {problemLabel}:{" "}
        </Typography>
        <Typography variant="body2" component="span" sx={{ color: theme.palette.grey[400] }}>
          {problem}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} alignItems="center" mt={2} color={theme.palette.grey[400]} fontSize="small">
        <Comment />
        200 <Box sx={{ ml: "auto" }}>00:00</Box>
      </Stack>
    </Box>
  );
};

export default CardItem;
