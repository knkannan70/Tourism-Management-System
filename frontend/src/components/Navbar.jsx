import React, { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem,
  Avatar, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme, Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ThemeContext';
import GlobalSearch from './GlobalSearch';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setAnchorEl(null);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Places', path: '/places' },
    { label: 'Hotels', path: '/hotels' },
    { label: 'Packages', path: '/packages' },
    ...(user && user.role === 'USER' ? [
      { label: 'My Bookings', path: '/my-bookings' },
      { label: 'Wishlist', path: '/wishlist' },
      { label: 'Feedback', path: '/feedback' },
    ] : []),
    ...(user && user.role === 'ADMIN' ? [
      { label: 'Admin Panel', path: '/admin' },
    ] : []),
  ];

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <FlightTakeoffIcon sx={{ fontSize: 32, color: '#ffffff' }} />
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: '"Outfit", sans-serif',
                fontWeight: 800,
                color: '#ffffff',
                textDecoration: 'none',
                letterSpacing: '-0.5px',
                flexGrow: isMobile ? 1 : 0,
                mr: 4,
              }}
            >
              Tour<Box component="span" sx={{ color: 'rgba(255,255,255,0.8)' }}>Vista</Box>
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'block' }, mx: 2 }}>
              <GlobalSearch />
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, justifyContent: 'center' }}>
                {navLinks.map((link) => (
                  <Button
                    key={link.path}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: 'rgba(255,255,255,0.85)',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      position: 'relative',
                      background: 'transparent',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '0%',
                        height: '2px',
                        bottom: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#ffffff',
                        transition: 'width 0.3s ease',
                      },
                      '&:hover': { 
                        color: '#ffffff', 
                        background: 'transparent',
                        '&::after': {
                          width: '70%',
                        }
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {user ? (
                <>
                  <Avatar
                    src={user.profileImageUrl}
                    sx={{ width: 38, height: 38, cursor: 'pointer', bgcolor: '#ffffff', color: 'primary.main', fontWeight: 700 }}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                  >
                    {(user.fullName || user.username || '').charAt(0).toUpperCase()}
                  </Avatar>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    {user.role === 'USER' && (
                      <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>Profile</MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    sx={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    sx={{ 
                      background: '#ffffff !important', 
                      color: '#c1121f !important', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                      fontWeight: 700,
                      '&:hover': { background: '#f1f5f9 !important', transform: 'translateY(-2px)' } 
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
              {isMobile && (
                <IconButton sx={{ color: '#ffffff' }} onClick={() => setDrawerOpen(true)}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <List>
            {navLinks.map((link) => (
              <ListItem
                key={link.path}
                onClick={() => { navigate(link.path); setDrawerOpen(false); }}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(225, 29, 72, 0.05)', color: 'primary.main' } }}
              >
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Toolbar /> {/* Spacer for fixed AppBar */}
      <Outlet />
    </>
  );
};

export default Navbar;
