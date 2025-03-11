import React from "react";
import { BugReport, QuestionAnswer, Comment, Add } from "@mui/icons-material";
import { Box, Chip, Typography, Stack, useTheme } from "@mui/material";

interface CardItemProps {
  title: string;
  autor: string | undefined;
  categories: string[];
  problemType: string;
  changes: number;
}

const CardItem: React.FC<CardItemProps> = ({ title, categories, autor, problemType, changes }) => {
  const theme = useTheme();

  const getTitleIcon = () => {
    const titleLowerCase = title.toLowerCase();
    if (/(feat|rep)/.test(titleLowerCase)) return { icon: <Add />, color: theme.palette.success.main, label: "Feature" };
    if (/(fix|bug|correção)/.test(titleLowerCase)) return { icon: <BugReport />, color: theme.palette.error.main, label: "Bug" };
    return { icon: undefined, color: theme.palette.secondary.main };
  };

  const { icon: titleIcon, color: titleColor, label: titleLable } = getTitleIcon();

  return (
    <Box bgcolor={theme.palette.grey[700]} p={2} my={1} borderRadius={2}>
      <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
        {categories.map((category, index) => (
          <Chip
            key={index}
            icon={titleIcon}
            label={titleLable}
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
      <Typography variant="h6" color="white" fontWeight="bold">
        {title}
      </Typography>
      <Box>
        <Typography variant="body2" component="span" sx={{ color: theme.palette.grey[400] }}>
          {autor}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} gap={0.5} alignItems="center" mt={1} color={theme.palette.grey[400]} fontSize="small">
        <Comment sx={{fontSize: 18}}/>
        {changes} <Box sx={{ ml: "auto" }}>00:00</Box>
      </Stack>
    </Box>
  );
};

export default CardItem;
