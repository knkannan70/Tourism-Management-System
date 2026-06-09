import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemIcon, ListItemText, IconButton, Avatar, Menu, MenuItem,
  Divider, Chip, useMediaQuery, useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PlaceIcon from '@mui/icons-material/Place';
import HotelIcon from '@mui/icons-material/Hotel';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import StarIcon from '@mui/icons-material/Star';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuIcon from '@mui/icons-material/Menu';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Places', icon: <PlaceIcon />, path: '/admin/places' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/admin/categories' },
  { text: 'Hotels', icon: <HotelIcon />, path: '/admin/hotels' },
  { text: 'Packages', icon: <CardTravelIcon />, path: '/admin/packages' },
  { text: 'Bookings', icon: <BookOnlineIcon />, path: '/admin/bookings' },
  { text: 'Feedback', icon: <StarIcon />, path: '/admin/feedback' },
  { text: 'Reports', icon: <BarChartIcon />, path: '/admin/reports' },
];


const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#000000' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <FlightTakeoffIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: 'white', fontFamily: '"Outfit", sans-serif', fontWeight: 800 }}>
          Tour<span style={{ color: '#c1121f' }}>Vista</span>
        </Typography>
      </Box>
      <Box sx={{ px: 2, pb: 1 }}>
        <Chip label="Admin Panel" size="small" sx={{ bgcolor: 'rgba(193, 18, 31, 0.2)', color: 'primary.main', fontWeight: 600, border: '1px solid rgba(193, 18, 31, 0.5)' }} />
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1 }} />
      <List sx={{ px: 1, flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
              <ListItem
              key={item.path}
              component={RouterLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 0,
                mb: 0.5,
                cursor: 'pointer',
                textDecoration: 'none',
                position: 'relative',
                background: isActive ? 'linear-gradient(90deg, rgba(193, 18, 31, 0.15) 0%, rgba(0,0,0,0) 100%)' : 'transparent',
                borderLeft: isActive ? '4px solid #c1121f' : '4px solid transparent',
                '&:hover': { background: 'linear-gradient(90deg, rgba(193, 18, 31, 0.1) 0%, rgba(0,0,0,0) 100%)' },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'rgba(255,255,255,0.6)', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem',
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#ffffff', color: 'primary.main', fontWeight: 700, width: 36, height: 36 }}>
          {(user?.username || 'A').charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>{user?.username || 'Admin'}</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Administrator</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', boxSizing: 'border-box' } }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', width: '100%' }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 2, color: 'primary.main' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}>
              {menuItems.find((m) => m.path === location.pathname)?.text || 'Admin'}
            </Typography>
            <Avatar
              sx={{ width: 36, height: 36, bgcolor: '#ffffff', color: 'primary.main', cursor: 'pointer', fontWeight: 700 }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              {(user?.username || 'A').charAt(0).toUpperCase()}
            </Avatar>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem
                onClick={() => {
                  logout();
                  navigate('/login');
                  setAnchorEl(null);
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
