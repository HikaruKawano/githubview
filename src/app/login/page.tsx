'use client';
import { useState } from 'react';
import { TextField, Button, Container, Typography, Stack, Box, InputAdornment, IconButton, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import GitHubIcon from '@mui/icons-material/GitHub';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

const setCookie = (name: string, value: string, days: number) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }
};

function Login() {
  const [owner, setOwner] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (owner && token) {
      setCookie('authToken', token, 7);
      setCookie('githubOwner', owner, 7);
      router.push('/');
    } else {
      setError('Por favor, preencha todos os campos.');
    }
  };

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

            {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <Stack spacing={3}>
                <TextField
                  label="GitHub Owner"
                  variant="outlined"
                  fullWidth
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GitHubIcon sx={{ color: 'white' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.23)'
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: { color: 'white' }
                  }}
                />

                <TextField
                  label="Access Token"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockPersonIcon sx={{ color: 'white' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: 'white' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.23)'
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: { color: 'white' }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease',
                    color: 'white',
                    fontWeight: 'bold',
                    py: 1.5
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
              Your credentials are securely encrypted and never stored
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;