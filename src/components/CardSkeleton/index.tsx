import React from "react";
import { Box, Chip, Stack, Typography, Skeleton, useTheme } from "@mui/material";

const CardItemSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      p={3}
      borderRadius={4}
      sx={{
        width: { xs: "100%", sm: 350, md: 400 },
        height: 300,
        border: '1px solid rgba(255, 255, 255, 0.1)',
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
      <Stack spacing={2}>
        {/* Placeholder do tipo de problema */}
        <Chip
          icon={<Skeleton variant="circular" width={20} height={20} />}
          label={<Skeleton width={80} height={20} />}
          size="small"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            color: theme.palette.text.primary,
            border: '1px solid rgba(255, 255, 255, 0.23)',
            alignSelf: 'flex-start',
          }}
        />

        {/* Título */}
        <Skeleton variant="text" width="90%" height={30} />
        <Skeleton variant="text" width="70%" height={25} />

        {/* Autor */}
        <Skeleton variant="text" width="50%" height={20} />

        {/* Barra de progresso */}
        <Skeleton variant="rectangular" width="100%" height={6} sx={{ mt: 1, borderRadius: 3 }} />

        {/* Status/resumo */}
        <Skeleton variant="text" width="40%" height={20} />
      </Stack>

      {/* Dias abertos */}
      <Skeleton variant="text" width="60%" height={15} sx={{ mt: 2 }} />
    </Box>
  );
};

export default CardItemSkeleton;
