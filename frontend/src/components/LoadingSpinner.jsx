import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 300,
      gap: 2,
    }}
  >
    <CircularProgress sx={{ color: 'primary.main' }} size={48} />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
);

export default LoadingSpinner;
