import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Grid,
  TextField, Button, Alert, Avatar, Divider, CircularProgress, IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LockIcon from '@mui/icons-material/Lock';
import { getProfile, updateProfile, uploadProfileImage, changePassword } from '../api/userApi';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, login, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const fileInputRef = useRef();

  useEffect(() => {
    getProfile()
      .then((res) => {
        const data = res.data.data;
        setProfile(data);
        setForm({ fullName: data.fullName || '', phone: data.phone || '', address: data.address || '' });
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await updateProfile(form);
      const updated = res.data.data;
      setProfile(updated);
      login(updated, token);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadProfileImage(file);
      const updated = res.data.data;
      setProfile(updated);
      login(updated, token);
      setSuccess('Profile photo updated!');
    } catch {
      setError('Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }
    setPwdSaving(true);
    try {
      await changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      setPwdSuccess('Password changed successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>My Profile</Typography>

        <Grid container spacing={4}>
          {/* Avatar Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    src={profile?.profileImageUrl}
                    sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: '3rem', fontWeight: 700, mx: 'auto' }}
                  >
                    {profile?.fullName?.charAt(0) || 'U'}
                  </Avatar>
                  <IconButton
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: '#000',
                      width: 36,
                      height: 36,
                      '&:hover': { bgcolor: '#d97706' },
                    }}
                    size="small"
                  >
                    {uploading ? <CircularProgress size={16} /> : <CameraAltIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile?.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Member since</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Edit Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Edit Profile</Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={profile?.email || ''}
                    disabled
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ color: '#94a3b8', mr: 1 }} />,
                    }}
                    helperText="Email cannot be changed"
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ color: 'primary.main', mr: 1 }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    multiline
                    rows={3}
                    InputProps={{
                      startAdornment: <HomeIcon sx={{ color: 'primary.main', mr: 1, alignSelf: 'flex-start', mt: 1 }} />,
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={saving}
                    sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, py: 1.5 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mt: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Change Password</Typography>
                
                {pwdError && <Alert severity="error" sx={{ mb: 2 }}>{pwdError}</Alert>}
                {pwdSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwdSuccess}</Alert>}

                <Box component="form" onSubmit={handlePasswordChange} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    required
                    value={pwdForm.currentPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                    InputProps={{
                      startAdornment: <LockIcon sx={{ color: 'primary.main', mr: 1 }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    required
                    value={pwdForm.newPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                    InputProps={{
                      startAdornment: <LockIcon sx={{ color: 'primary.main', mr: 1 }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    required
                    value={pwdForm.confirmPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                    InputProps={{
                      startAdornment: <LockIcon sx={{ color: 'primary.main', mr: 1 }} />,
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={pwdSaving}
                    sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, py: 1.5 }}
                  >
                    {pwdSaving ? 'Updating...' : 'Update Password'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProfilePage;
