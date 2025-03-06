import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1e1e1e',
      paper: '#2a2a2a',
    },
    primary: {
      main: '#444',
    },
    secondary: {
      main: '#333',
    },
    error: {
      main: '#ff0000',
    },
    info: {
      main: '#0000ff',
    },
    text: {
      primary: '#ffffff',
      secondary: '#acacac',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h2: {
      fontSize: '20px',
      fontWeight: 'bold',
    },
    body1: {
      fontSize: '15px',
    },
    body2: {
      fontSize: '14px',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '20px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: 'white',
          '&:hover': {
            backgroundColor: '#555',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          padding: '10px',
          borderRadius: '5px',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },
  },
});

export default theme;
