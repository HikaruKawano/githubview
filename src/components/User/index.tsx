'use client';
import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Stack,
  Link,
  CircularProgress,
  Modal,
  IconButton,
  Button,
  Backdrop
} from "@mui/material";
import { useRouter } from "next/navigation";
import { GetUserData } from "@/services/github/userService";
import { CreateOctokit } from "@/services/github/octokit";
import CloseIcon from "@mui/icons-material/Close";

interface UserProfileModalProps {
  owner: string | undefined;
  token: string | undefined;
  open: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  owner,
  token,
  open,
  onClose,
}: UserProfileModalProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!open || !owner || !token) return;

    var octokit = CreateOctokit(token);

    const fetchUserData = async () => {
      const data = await GetUserData(octokit, owner);
      setUser(data);
      setLoading(false);
    };

    fetchUserData();
  }, [owner, token, open]);

  const handleLogout = () => {
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "githubOwner=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      aria-labelledby="user-profile-modal"
      BackdropComponent={(props) => (
        <Backdrop
          {...props}
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)'
          }}
        />
      )}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: 'rgba(32, 32, 32, 0.95)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          borderRadius: 4,
          p: 4,
          maxWidth: 500,
          width: '90%',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ 
            position: "absolute", 
            top: 16, 
            right: 16,
            color: 'text.secondary'
          }}
        >
          <CloseIcon />
        </IconButton>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : !user ? (
          <Typography color="error">Erro ao carregar perfil</Typography>
        ) : (
          <>
            <Avatar
              src={user.avatar_url}
              sx={{ 
                width: 120, 
                height: 120, 
                mx: "auto", 
                mb: 2,
                border: '2px solid rgba(255, 255, 255, 0.1)'
              }}
            />
            <Typography variant="h5" textAlign="center" color="text.primary">
              {user.name || user.login}
            </Typography>
            {user.bio && (
              <Typography 
                variant="body2" 
                textAlign="center" 
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {user.bio}
              </Typography>
            )}

            <Stack spacing={1.5} sx={{ mt: 3 }}>
              {user.company && (
                <Typography color="text.primary">
                  🏢 {user.company}
                </Typography>
              )}
              {user.location && (
                <Typography color="text.primary">
                  📍 {user.location}
                </Typography>
              )}
              {user.email && (
                <Typography color="text.primary">
                  📧 {user.email}
                </Typography>
              )}
              {user.blog && (
                <Link 
                  href={user.blog} 
                  target="_blank" 
                  rel="noopener"
                  color="primary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  🔗 {user.blog}
                </Link>
              )}
              <Typography color="text.primary">
                📦 Repositórios públicos: {user.public_repos}
              </Typography>
              <Typography color="text.primary">
                👥 Seguidores: {user.followers}
              </Typography>
              <Typography color="text.primary">
                🔄 Seguindo: {user.following}
              </Typography>
              <Typography color="text.primary">
                📅 Desde: {new Date(user.created_at).toLocaleDateString()}
              </Typography>
            </Stack>

            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={handleLogout}
              sx={{ 
                mt: 3,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Logout
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
}