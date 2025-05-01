'use client';

import { signIn } from "next-auth/react";
import { Button, Container, Typography, Stack, Box } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Login() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
        p: 2
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            p: 4,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Stack spacing={3} alignItems="center">
            <GitHubIcon sx={{ fontSize: 40, color: 'white' }} />
            <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 700 }}>
              GitHub Login
            </Typography>

            <Button
              onClick={() => signIn("github")}
              fullWidth
              variant="contained"
              size="large"
              startIcon={<GitHubIcon />}
              sx={{
                bgcolor: 'black',
                '&:hover': {
                  bgcolor: '#333',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease',
                color: 'white',
                fontWeight: 'bold',
                py: 1.5
              }}
            >
              Sign in with GitHub
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
