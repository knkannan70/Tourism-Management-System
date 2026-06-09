import React, { useState } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField,
  Button, Alert, InputAdornment, IconButton, Link,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/authApi';

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', address: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerUser(form);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side Background */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        position: 'relative',
        backgroundImage: 'url(https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=2068&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1, p: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontFamily: '"Outfit", sans-serif' }}>
            Begin Your Journey
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 400, opacity: 0.9 }}>
            Join us and explore the most beautiful destinations.
          </Typography>
        </Box>
      </Box>

      {/* Right Side Form */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', p: { xs: 2, sm: 4, md: 6 } }}>
        <Box sx={{ width: '100%', maxWidth: 450, maxHeight: '90vh', overflowY: 'auto', pr: 1 }}>
          <Box sx={{ textAlign: 'left', mb: 4 }}>
            <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: 'primary.main', mb: 1 }}>
              TourVista
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>Create Account</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Register to start exploring.</Typography>
          </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5 }}
                required
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5 }}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)}>
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5 }}
                required
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5 }}
              />
              <TextField
                fullWidth
                label="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                  py: 1.5,
                  fontSize: '1rem',
                  mb: 2,
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
  );
};

export default Register;
