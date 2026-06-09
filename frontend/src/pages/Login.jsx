import React, { useState } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField,
  Button, Alert, Tabs, Tab, InputAdornment, IconButton, Link,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, loginAdmin, resetPassword } from '../api/authApi';

const Login = () => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [forgotForm, setForgotForm] = useState({ email: '', newPassword: '' });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = tab === 0 ? loginUser : loginAdmin;
      const res = await fn(form);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      navigate(tab === 1 ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      await resetPassword(forgotForm);
      setForgotSuccess('Password reset successfully! You can now login.');
      setForgotForm({ email: '', newPassword: '' });
      setTimeout(() => setForgotDialogOpen(false), 2000);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex' }}>
        {/* Left Side Background */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        position: 'relative',
        backgroundImage: 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
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
            Discover the World
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 400, opacity: 0.9 }}>
            Your premium travel experience starts here.
          </Typography>
        </Box>
      </Box>

      {/* Right Side Form */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', p: { xs: 2, sm: 4, md: 6 } }}>
        <Box sx={{ width: '100%', maxWidth: 450 }}>
          <Box sx={{ textAlign: 'left', mb: 4 }}>
            <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: 'primary.main', mb: 1 }}>
              TourVista
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>Welcome Back</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Please enter your details to sign in.</Typography>
          </Box>

            <Tabs
              value={tab}
              onChange={(_, v) => { setTab(v); setError(''); setForm({ identifier: '', password: '' }); }}
              sx={{ mb: 3 }}
              variant="fullWidth"
            >
              <Tab icon={<PersonIcon />} label="User Login" iconPosition="start" />
              <Tab icon={<AdminPanelSettingsIcon />} label="Admin Login" iconPosition="start" />
            </Tabs>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label={tab === 0 ? 'Email Address' : 'Username'}
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
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
                sx={{ mb: 3 }}
                required
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
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              {tab === 0 && (
                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => { setForgotDialogOpen(true); setForgotSuccess(''); setForgotError(''); }}
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    Forgot Password?
                  </Link>
                </Box>
              )}
            </Box>

            {tab === 0 && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/register" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Register here
                  </Link>
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotDialogOpen} onClose={() => setForgotDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reset Password</DialogTitle>
        <Box component="form" onSubmit={handleForgotSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {forgotError && <Alert severity="error" sx={{ mb: 2 }}>{forgotError}</Alert>}
            {forgotSuccess && <Alert severity="success" sx={{ mb: 2 }}>{forgotSuccess}</Alert>}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your registered email and a new password.
            </Typography>
            <TextField
              fullWidth
              label="Email Address"
              required
              value={forgotForm.email}
              onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              required
              value={forgotForm.newPassword}
              onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setForgotDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={forgotLoading}
              sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              {forgotLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default Login;
