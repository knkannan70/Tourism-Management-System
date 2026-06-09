import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Chip, Avatar,
  IconButton, Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, FormControl, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InputAdornment from '@mui/material/InputAdornment';
import { getAllUsers, updateUser, deleteUser, createUser, disableUser, enableUser } from '../../api/adminApi';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({ fullName: '', email: '', password: '', phone: '', address: '' });

  const fetchUsers = () => {
    getAllUsers()
      .then((res) => {
        const data = res.data.data || [];
        setUsers(data);
        setFiltered(data);
      })
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let result = [...users];
    const q = search.toLowerCase();
    if (q) {
      result = result.filter((u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q)
      );
    }
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return String(a.fullName || '').localeCompare(String(b.fullName || ''), undefined, { sensitivity: 'base' });
        case 'name_desc': return String(b.fullName || '').localeCompare(String(a.fullName || ''), undefined, { sensitivity: 'base' });
        case 'date_desc': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'date_asc': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default: return 0;
      }
    });
    
    setFiltered([...result]);
  }, [search, users, sortBy]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ fullName: user.fullName || '', phone: user.phone || '', address: user.address || '' });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateUser(selectedUser.id, editForm);
      fetchUsers();
      setEditDialog(false);
    } catch {
      setError('Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(selectedUser.id);
      fetchUsers();
      setDeleteDialog(false);
    } catch {
      setError('Failed to delete user.');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.active) {
        await disableUser(user.id);
      } else {
        await enableUser(user.id);
      }
      fetchUsers();
    } catch {
      setError('Failed to update user status.');
    }
  };

  const handleCreate = async () => {
    if (!addForm.fullName || !addForm.email || !addForm.password) {
      setError('Name, Email and Password are required.');
      return;
    }
    setSaving(true);
    try {
      await createUser(addForm);
      fetchUsers();
      setAddDialog(false);
      setAddForm({ fullName: '', email: '', password: '', phone: '', address: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Manage Users</Typography>
          <Typography color="text.secondary">{filtered.length} users total</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialog(true)}
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Add User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
            <TextField
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ width: 200, ml: 2 }}>
              <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                <MenuItem value="date_desc">Recently Joined</MenuItem>
                <MenuItem value="date_asc">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={user.profileImageUrl}
                          sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.9rem' }}
                        >
                          {user.fullName?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.fullName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{user.phone || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'ADMIN' ? 'error' : 'primary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.active ? 'Active' : 'Disabled'}
                        size="small"
                        color={user.active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => { setSelectedUser(user); setViewDialog(true); }} sx={{ color: '#0ea5e9' }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(user)} sx={{ color: 'primary.main' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user.role !== 'ADMIN' && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            color={user.active ? 'error' : 'success'}
                            onClick={() => handleToggleStatus(user)}
                            sx={{ mx: 1, textTransform: 'none', py: 0 }}
                          >
                            {user.active ? 'Disable' : 'Enable'}
                          </Button>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => { setSelectedUser(user); setDeleteDialog(true); }}
                            sx={{ color: '#ef4444' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <TextField
            label="Full Name"
            value={editForm.fullName}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Phone"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            fullWidth
          />
          <TextField
            label="Address"
            value={editForm.address}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
            multiline
            rows={2}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={saving}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <TextField
            label="Full Name"
            value={addForm.fullName}
            onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Email"
            type="email"
            value={addForm.email}
            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={addForm.password}
            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
            fullWidth
            required
            helperText="Minimum 6 characters"
          />
          <TextField
            label="Phone"
            value={addForm.phone}
            onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
            fullWidth
          />
          <TextField
            label="Address"
            value={addForm.address}
            onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
            multiline
            rows={2}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            {saving ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedUser?.fullName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar src={selectedUser.profileImageUrl} variant="rounded" sx={{ width: 100, height: 100, mx: 'auto', mb: 1, bgcolor: 'primary.main', fontSize: '2rem' }}>
                  {selectedUser.fullName?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h6">{selectedUser.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                  <Chip label={selectedUser.role} size="small" color={selectedUser.role === 'ADMIN' ? 'error' : 'primary'} />
                  <Chip label={selectedUser.active ? 'Active' : 'Disabled'} size="small" color={selectedUser.active ? 'success' : 'default'} />
                </Box>
              </Box>
              <Typography><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</Typography>
              <Typography><strong>Address:</strong> {selectedUser.address || 'N/A'}</Typography>
              <Typography><strong>Joined On:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN') : 'N/A'}</Typography>
              <Typography><strong>Last Login:</strong> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('en-IN') : 'N/A'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsers;
