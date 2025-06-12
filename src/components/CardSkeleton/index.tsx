import { Box, Skeleton } from '@mui/material';

const CardItemSkeleton = () => (
  <Box
    sx={{
      width: { xs: '100%', sm: 400, md: 420 },
      minHeight: 320,
      p: 3,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.04)',
      animation: 'fadeSlideIn 0.4s ease',
    }}
  >
    <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="80%" height={22} />
    <Skeleton variant="rectangular" height={12} sx={{ my: 2, borderRadius: 2 }} />
    <Skeleton variant="text" width="40%" />
    <Skeleton variant="circular" width={32} height={32} sx={{ mt: 2 }} />
  </Box>
);

export default CardItemSkeleton;
