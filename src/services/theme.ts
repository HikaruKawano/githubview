import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1a1a1a',
      paper: 'rgba(32, 32, 32, 0.8)',
    },
    primary: {
      main: '#1976d2',
      dark: '#115293',
      light: '#4791db',
    },
    secondary: {
      main: 'rgba(255, 255, 255, 0.1)',
    },
    error: {
      main: '#ff5252',
    },
    info: {
      main: '#2196f3',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.7)',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0, 0, 0, 0.1)',
    '0 4px 16px rgba(0, 0, 0, 0.15)',
    ...Array(22).fill('none'),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
          background: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.23)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
            borderWidth: '1px',
          },
        },
        input: {
          '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.5)',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-focused': {
            color: '#1976d2',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;