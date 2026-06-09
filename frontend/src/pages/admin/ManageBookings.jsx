import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Chip,
  IconButton, Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, InputAdornment, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { adminGetAllBookings, adminUpdateBookingStatus, adminDeleteBooking } from '../../api/bookingApi';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [statusDialog, setStatusDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBookings = () => {
    adminGetAllBookings()
      .then((res) => {
        const data = res.data.data || [];
        setBookings(data);
        setFiltered(data);
      })
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let result = [...bookings];
    const q = search.toLowerCase();
    if (q) {
      result = result.filter((b) =>
        b.userFullName?.toLowerCase().includes(q) ||
        b.userEmail?.toLowerCase().includes(q) ||
        b.tourPackage?.packageName?.toLowerCase().includes(q) ||
        b.bookingStatus?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return String(a.userFullName || '').localeCompare(String(b.userFullName || ''), undefined, { sensitivity: 'base' });
        case 'name_desc': return String(b.userFullName || '').localeCompare(String(a.userFullName || ''), undefined, { sensitivity: 'base' });
        case 'date_desc': return new Date(b.bookingDate || 0) - new Date(a.bookingDate || 0);
        case 'date_asc': return new Date(a.bookingDate || 0) - new Date(b.bookingDate || 0);
        case 'price_asc': return (a.totalAmount || 0) - (b.totalAmount || 0);
        case 'price_desc': return (b.totalAmount || 0) - (a.totalAmount || 0);
        default: return 0;
      }
    });

    setFiltered([...result]);
  }, [search, bookings, sortBy]);

  const handleOpenStatus = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.bookingStatus);
    setStatusDialog(true);
  };

  const handleOpenView = (booking) => {
    setSelectedBooking(booking);
    setViewDialog(true);
  };

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      await adminUpdateBookingStatus(selectedBooking.id, newStatus);
      setSuccess('Booking status updated successfully!');
      fetchBookings();
      setStatusDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminDeleteBooking(selectedBooking.id);
      setSuccess('Booking deleted successfully!');
      fetchBookings();
      setDeleteDialog(false);
    } catch (err) {
      setError('Failed to delete booking.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'COMPLETED': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Manage Bookings</Typography>
        <Typography color="text.secondary">{filtered.length} bookings total</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
            <TextField
              placeholder="Search bookings..."
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
                <MenuItem value="date_desc">Most Recent</MenuItem>
                <MenuItem value="date_asc">Oldest First</MenuItem>
                <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                <MenuItem value="price_desc">Highest Price</MenuItem>
                <MenuItem value="price_asc">Lowest Price</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Booking ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Package</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Travel Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Price</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}># {b.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{b.userFullName}</Typography>
                        <Typography variant="caption" color="text.secondary">{b.userEmail}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{b.tourPackage?.packageName || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN') : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ₹{(b.totalAmount || 0).toLocaleString('en-IN')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={b.bookingStatus}
                        size="small"
                        color={getStatusColor(b.bookingStatus)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleOpenView(b)} sx={{ color: '#3b82f6' }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Change Status">
                        <IconButton size="small" onClick={() => handleOpenStatus(b)} sx={{ color: 'primary.main' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => { setSelectedBooking(b); setDeleteDialog(true); }}
                          sx={{ color: '#ef4444' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Booking Details</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Customer Info</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedBooking?.userFullName}</Typography>
            <Typography variant="body2" color="text.secondary">{selectedBooking?.userEmail}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Package Booked</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedBooking?.tourPackage?.packageName}</Typography>
            <Typography variant="body2" color="text.secondary">{selectedBooking?.tourPackage?.duration} • ₹{selectedBooking?.tourPackage?.price?.toLocaleString('en-IN')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Booking Date</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {selectedBooking?.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleDateString('en-IN') : '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Travel Date</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {selectedBooking?.travelDate ? new Date(selectedBooking.travelDate).toLocaleDateString('en-IN') : '—'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Total Amount Paid</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                ₹{selectedBooking?.totalAmount?.toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Chip
              label={selectedBooking?.bookingStatus}
              color={getStatusColor(selectedBooking?.bookingStatus)}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={() => setViewDialog(false)} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Booking Status</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="status-select-label">Booking Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newStatus}
              label="Booking Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={saving}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            {saving ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete Booking <strong># {selectedBooking?.id}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageBookings;
