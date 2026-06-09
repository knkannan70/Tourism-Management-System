import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

export const useColorMode = () => useContext(ColorModeContext);

export const CustomThemeProvider = ({ children }) => {
  const mode = 'light'; // Forced light mode

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        // Disabled
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#c1121f' : '#f87171',
            light: '#e01b2a',
            dark: '#8b0c15',
            contrastText: '#ffffff',
          },
          secondary: {
            main: mode === 'light' ? '#000000' : '#ffffff',
            light: '#333333',
            dark: '#000000',
            contrastText: mode === 'light' ? '#ffffff' : '#000000',
          },
          background: {
            default: mode === 'light' ? '#fafafa' : '#0f172a',
            paper: mode === 'light' ? '#ffffff' : '#1e293b',
          },
          text: {
            primary: mode === 'light' ? '#0f172a' : '#f8fafc',
            secondary: mode === 'light' ? '#475569' : '#94a3b8',
          },
          success: { main: '#10b981' },
          error: { main: '#ef4444' },
          warning: { main: '#f59e0b' },
          info: { main: '#3b82f6' },
        },
        typography: {
          fontFamily: '"Inter", "Outfit", sans-serif',
          h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 800 },
          h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 800 },
          h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
          h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
          h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
          h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
        },
        shape: { borderRadius: 16 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 50,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '10px 24px',
                transition: 'all 0.3s ease',
              },
              containedPrimary: {
                background: mode === 'light' 
                  ? 'linear-gradient(45deg, #c1121f 30%, #a00f1a 90%)'
                  : 'linear-gradient(45deg, #f87171 30%, #dc2626 90%)',
                boxShadow: mode === 'light' ? '0 4px 14px 0 rgba(193, 18, 31, 0.39)' : '0 4px 14px 0 rgba(248, 113, 113, 0.39)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'light' ? '0 6px 20px rgba(193, 18, 31, 0.5)' : '0 6px 20px rgba(248, 113, 113, 0.5)',
                }
              }
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 20,
                boxShadow: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.5)',
                backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: mode === 'light' ? '0 12px 28px rgba(0,0,0,0.12)' : '0 12px 28px rgba(0,0,0,0.7)',
                  transform: 'translateY(-4px)',
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  backgroundColor: mode === 'light' ? '#ffffff' : '#334155',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: mode === 'light' ? '#fafafa' : '#475569',
                  },
                  '&.Mui-focused': {
                    backgroundColor: mode === 'light' ? '#ffffff' : '#334155',
                    boxShadow: mode === 'light' ? '0 0 0 3px rgba(225, 29, 72, 0.1)' : '0 0 0 3px rgba(248, 113, 113, 0.2)',
                  }
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#c1121f' : '#1e293b',
                color: '#ffffff',
                boxShadow: mode === 'light' ? '0 4px 12px rgba(193, 18, 31, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
              },
              head: {
                backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
                fontWeight: 600,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { 
                borderRadius: 8,
                fontWeight: 600,
              },
              outlined: {
                borderColor: mode === 'light' ? '#e2e8f0' : '#475569',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};
