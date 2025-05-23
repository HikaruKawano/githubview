'use client';
import { useState, useCallback, memo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, CircularProgress, Slide,
  Box
} from '@mui/material';
import { Feedback } from '@mui/icons-material';
import Swal from 'sweetalert2';
import theme from '@/services/theme';

interface SuggestionModalProps {
  onSubmit: (text: string) => Promise<void>;
}

const SlideTransition = memo(function SlideTransition(
  props: { children: React.ReactElement } & React.Attributes
) {
  return <Slide direction="up" {...props} />;
});

export const SuggestionButtonWithModal = memo(function SuggestionButtonWithModal({
  onSubmit
}: SuggestionModalProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setText('');
    setOpen(false);
  }, [isSubmitting]);

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) {
      await Swal.fire({
        title: 'Atenção',
        text: 'Por favor, escreva sua sugestão antes de enviar.',
        icon: 'warning',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText('');
      setOpen(false);
      await Swal.fire({
        title: 'Sucesso',
        text: 'Sua sugestão foi enviada com sucesso!',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      console.error('Erro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao enviar sua sugestão';
      await Swal.fire({
        title: 'Erro',
        text: errorMessage,
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [text, onSubmit]);

  return (
    <Box>
      {/* Botão Flutuante */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<Feedback />}
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          borderRadius: '50px',
          boxShadow: theme.shadows[4],
          zIndex: 1000
        }}
      >
        Sugestões
      </Button>

      {/* Modal de Sugestão */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        keepMounted={false}
        sx={{
          '& .MuiDialog-paper': {
            transform: 'translateY(0) !important',
            willChange: 'auto',
            opacity: open ? 1 : 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            transition: 'opacity 100ms ease-in-out'
          },
          '& .MuiBackdrop-root': {
            transition: 'opacity 100ms ease-in-out',
            opacity: open ? 1 : 0
          }
        }}
      >
        <DialogTitle sx={{ py: 2 }}>Enviar Sugestão</DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Como podemos melhorar?"
            placeholder="Descreva sua sugestão aqui..."
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
            sx={{ mt: 1, mb: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClose}
            color="error"
            disabled={isSubmitting}
            sx={{ minWidth: 100 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={isSubmitting || !text.trim()}
            endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            sx={{ minWidth: 150 }}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Sugestão'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});