'use client';

import { useState } from 'react';
import { TextField, Button, Container, Typography, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';

// Função segura para definir cookies no navegador
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
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (owner && token) {
      setCookie('authToken', token, 7);
      setCookie('githubOwner', owner, 7);
      router.push('/');
    } else {
      alert('Por favor, preencha todos os campos.');
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 8,
        bgcolor: 'background.default',
        p: 4,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" color="black" gutterBottom>
        Login GitHub
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Owner do GitHub"
            variant="outlined"
            sx={{ color: 'black' }}
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ style: { color: 'inherit' } }}
          />
          <TextField
            label="Token de Acesso"
            variant="outlined"
            value={token}
            sx={{ color: 'black' }}
            onChange={(e) => setToken(e.target.value)}
            fullWidth
            required
            type="password"
            InputLabelProps={{ style: { color: 'inherit' } }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Entrar
          </Button>
        </Stack>
      </form>
    </Container>
  );
}

export default Login;
