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
} from "@mui/material";
import { useRouter } from "next/navigation";
import { GetUserData } from "@/lib/github";
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

    const fetchUserData = async () => {
      const data = await GetUserData(owner, token);
      setUser(data);
      setLoading(false);
    };

    fetchUserData();
  }, [owner, token, open]);

  // Função de Logout
  const handleLogout = () => {
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "githubOwner=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="user-profile-modal">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
          maxWidth: 500,
          width: "100%",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        {loading ? (
          <CircularProgress />
        ) : !user ? (
          <Typography color="error">Erro ao carregar perfil</Typography>
        ) : (
          <>
            <Avatar
              src={user.avatar_url}
              sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
            />
            <Typography variant="h5" textAlign="center">
              {user.name || user.login}
            </Typography>
            <Typography variant="body2" textAlign="center" color="textSecondary">
              {user.bio}
            </Typography>

            <Stack spacing={1} sx={{ mt: 2 }}>
              {user.company && <Typography>🏢 {user.company}</Typography>}
              {user.location && <Typography>📍 {user.location}</Typography>}
              {user.email && <Typography>📧 {user.email}</Typography>}
              {user.blog && (
                <Link href={user.blog} target="_blank" rel="noopener">
                  🔗 {user.blog}
                </Link>
              )}
              <Typography>📦 Repositórios públicos: {user.public_repos}</Typography>
              <Typography>👥 Seguidores: {user.followers}</Typography>
              <Typography>🔄 Seguindo: {user.following}</Typography>
              <Typography>📅 Desde: {new Date(user.created_at).toLocaleDateString()}</Typography>
            </Stack>

            {/* Botão de Logout */}
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={handleLogout}
              sx={{ mt: 3 }}
            >
              Logout
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
}
