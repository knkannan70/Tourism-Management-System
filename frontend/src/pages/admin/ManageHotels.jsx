import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Avatar,
  IconButton, Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, InputAdornment, MenuItem, FormControl,
  InputLabel, Select, Grid, Rating
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HotelIcon from '@mui/icons-material/Hotel';
import StarIcon from '@mui/icons-material/Star';
import {
  getHotels, getStates, getDistrictsByState,
  adminCreateHotel, adminUpdateHotel, adminDeleteHotel, adminUploadHotelImage, adminUploadHotelGalleryImage
} from '../../api/packageApi';

const EMPTY_FORM = {
  hotelName: '', city: '', address: '',
  stateId: '', districtId: '',
  cost: 0, pricePerNight: 0,
  description: '', contactNumber: '',
  amenities: '', starRating: 3, roomTypes: '',
  videoUrl: '', googleMapsUrl: ''
};

const ManageHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [states, setStates] = useState([]);
  const [formDistricts, setFormDistricts] = useState([]);

  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchHotels = async () => {
    try {
      const res = await getHotels();
      const data = res.data.data || [];
      setHotels(data);
      setFiltered(data);
    } catch {
      setError('Failed to load hotels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    getStates().then(r => setStates(r.data.data || []));
  }, []);

  useEffect(() => {
    let result = [...hotels];
    const q = search.toLowerCase();
    if (q) {
      result = result.filter(h =>
        h.hotelName?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.stateName?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return String(a.hotelName || '').localeCompare(String(b.hotelName || ''), undefined, { sensitivity: 'base' });
        case 'name_desc': return String(b.hotelName || '').localeCompare(String(a.hotelName || ''), undefined, { sensitivity: 'base' });
        case 'rating_desc': return (b.rating || 0) - (a.rating || 0);
        case 'rating_asc': return (a.rating || 0) - (b.rating || 0);
        case 'date_desc': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'date_asc': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default: return 0;
      }
    });

    setFiltered([...result]);
  }, [search, hotels, sortBy]);

  const loadDistrictsForState = async (stateId) => {
    if (!stateId) { setFormDistricts([]); return; }
    try {
      const res = await getDistrictsByState(stateId);
      setFormDistricts(res.data.data || []);
    } catch { setFormDistricts([]); }
  };

  const handleOpenAdd = () => {
    setForm(EMPTY_FORM);
    setFormDistricts([]);
    setImageFile(null);
    setGalleryFiles([]);
    setAddDialog(true);
  };

  const handleOpenEdit = (hotel) => {
    setSelectedHotel(hotel);
    setForm({
      hotelName: hotel.hotelName || '',
      city: hotel.city || '',
      address: hotel.address || '',
      stateId: hotel.stateId || '',
      districtId: hotel.districtId || '',
      cost: hotel.cost || 0,
      pricePerNight: hotel.pricePerNight || 0,
      description: hotel.description || '',
      contactNumber: hotel.contactNumber || '',
      amenities: hotel.amenities || '',
      starRating: hotel.starRating || 3,
      roomTypes: hotel.roomTypes || '',
      videoUrl: hotel.videoUrl || '',
      googleMapsUrl: hotel.googleMapsUrl || '',
    });
    if (hotel.stateId) loadDistrictsForState(hotel.stateId);
    setImageFile(null);
    setGalleryFiles([]);
    setEditDialog(true);
  };

  const handleStateChange = (stateId) => {
    setForm(f => ({ ...f, stateId, districtId: '' }));
    loadDistrictsForState(stateId);
  };

  const handleCreate = async () => {
    if (!form.hotelName || !form.city) {
      setError('Hotel Name and City are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      const res = await adminCreateHotel(payload);
      const createdHotel = res.data.data;
      
      let imageError = false;
      try {
        if (imageFile) {
          await adminUploadHotelImage(createdHotel.id, imageFile);
        }
        if (galleryFiles.length > 0) {
          await Promise.all(galleryFiles.map(file => adminUploadHotelGalleryImage(createdHotel.id, file)));
        }
      } catch (imgErr) {
        imageError = true;
      }

      if (imageError) {
        setSuccess('Hotel added, but image upload failed (check GitHub token).');
      } else {
        setSuccess('Hotel added successfully!');
      }
      fetchHotels();
      setAddDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add hotel.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.hotelName || !form.city) {
      setError('Hotel Name and City are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      await adminUpdateHotel(selectedHotel.id, payload);
      
      let imageError = false;
      try {
        if (imageFile) {
          await adminUploadHotelImage(selectedHotel.id, imageFile);
        }
        if (galleryFiles.length > 0) {
          await Promise.all(galleryFiles.map(file => adminUploadHotelGalleryImage(selectedHotel.id, file)));
        }
      } catch (imgErr) {
        imageError = true;
      }

      if (imageError) {
        setSuccess('Hotel updated, but image upload failed.');
      } else {
        setSuccess('Hotel updated successfully!');
      }
      fetchHotels();
      setEditDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update hotel.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminDeleteHotel(selectedHotel.id);
      setSuccess('Hotel deleted successfully!');
      fetchHotels();
      setDeleteDialog(false);
    } catch {
      setError('Failed to delete hotel. It may have linked packages or bookings.');
    }
  };

  const HotelForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={8}>
          <TextField label="Hotel Name *" value={form.hotelName}
            onChange={e => setForm(f => ({ ...f, hotelName: e.target.value }))} fullWidth />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="City *" value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))} fullWidth />
        </Grid>
      </Grid>

      <TextField label="Address" value={form.address}
        onChange={e => setForm(f => ({ ...f, address: e.target.value }))} fullWidth
        placeholder="Full address of the hotel" />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>State</InputLabel>
            <Select value={form.stateId} label="State"
              onChange={e => handleStateChange(e.target.value)}>
              <MenuItem value="">-- Select State --</MenuItem>
              {states.map(s => <MenuItem key={s.id} value={s.id}>{s.stateName}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>District</InputLabel>
            <Select value={form.districtId} label="District"
              onChange={e => setForm(f => ({ ...f, districtId: e.target.value }))}
              disabled={!form.stateId}>
              <MenuItem value="">-- Select District --</MenuItem>
              {formDistricts.map(d => <MenuItem key={d.id} value={d.id}>{d.districtName}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={6} sm={4}>
          <TextField label="Cost / Night (₹)" type="number" value={form.pricePerNight}
            onChange={e => setForm(f => ({ ...f, pricePerNight: parseFloat(e.target.value) || 0, cost: parseFloat(e.target.value) || 0 }))} fullWidth />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField label="Contact Number" value={form.contactNumber}
            onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} fullWidth />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5, color: '#64748b' }}>Star Rating</Typography>
            <Rating value={form.starRating} onChange={(_, v) => setForm(f => ({ ...f, starRating: v }))}
              max={5} size="large" />
          </Box>
        </Grid>
      </Grid>

      <TextField label="Description" value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        multiline rows={2} fullWidth />

      <TextField label="Amenities" value={form.amenities}
        onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))}
        multiline rows={2} fullWidth
        placeholder="e.g. Free WiFi, Swimming Pool, Gym, Breakfast Included, AC, Parking..." />

      <TextField label="Room Types" value={form.roomTypes}
        onChange={e => setForm(f => ({ ...f, roomTypes: e.target.value }))}
        multiline rows={2} fullWidth
        placeholder="e.g. Standard Room, Deluxe Room, Suite" />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="YouTube / Vimeo Video URL" value={form.videoUrl}
            onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Google Maps Embed URL" value={form.googleMapsUrl}
            onChange={e => setForm(f => ({ ...f, googleMapsUrl: e.target.value }))} fullWidth />
        </Grid>
      </Grid>

      <Box>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Hotel Main Image (Cover)</Typography>
        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth
          sx={{ py: 1.5, borderStyle: 'dashed', borderColor: '#94a3b8' }}>
          Choose Main Image File
          <input type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && setImageFile(e.target.files[0])} />
        </Button>
        {imageFile && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'primary.main' }}>
            ✓ Selected: {imageFile.name}
          </Typography>
        )}
      </Box>

      <Box>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Gallery Images (Multiple)</Typography>
        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth
          sx={{ py: 1.5, borderStyle: 'dashed', borderColor: '#94a3b8' }}>
          Select Multiple Files
          <input type="file" hidden multiple accept="image/*" onChange={e => e.target.files && setGalleryFiles(Array.from(e.target.files))} />
        </Button>
        {galleryFiles.length > 0 && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'primary.main' }}>
            ✓ Selected {galleryFiles.length} files
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Manage Hotels</Typography>
          <Typography color="text.secondary">{filtered.length} of {hotels.length} hotels</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
          Add Hotel
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
            <TextField placeholder="Search hotels by name, city, state..." value={search}
              onChange={e => setSearch(e.target.value)} size="small" sx={{ width: 320 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment> }} />
            <FormControl size="small" sx={{ minWidth: 160, ml: 2 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={e => setSortBy(e.target.value)}>
                <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                <MenuItem value="rating_desc">Highest Rating</MenuItem>
                <MenuItem value="rating_asc">Lowest Rating</MenuItem>
                <MenuItem value="date_desc">Recently Added</MenuItem>
                <MenuItem value="date_asc">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Hotel</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Price/Night</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Stars</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((hotel) => (
                  <TableRow key={hotel.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={hotel.imageUrl} variant="rounded"
                          sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                          <HotelIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{hotel.hotelName}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {hotel.description || 'No description'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{hotel.city}</Typography>
                      <Typography variant="caption" color="text.secondary">{hotel.stateName || ''}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{(hotel.pricePerNight || hotel.cost || 0).toLocaleString('en-IN')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Rating value={hotel.starRating || 3} readOnly size="small" max={5} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                        <Typography variant="body2">{hotel.rating?.toFixed(1) || '0.0'}</Typography>
                        <Typography variant="caption" color="text.secondary">({hotel.reviewCount || 0})</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => { setSelectedHotel(hotel); setViewDialog(true); }} sx={{ color: '#0ea5e9' }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEdit(hotel)} sx={{ color: 'primary.main' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small"
                          onClick={() => { setSelectedHotel(hotel); setDeleteDialog(true); }}
                          sx={{ color: '#ef4444' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                      No hotels found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Hotel</DialogTitle>
        <DialogContent>{HotelForm()}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
            {saving ? 'Adding...' : 'Add Hotel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Hotel: {selectedHotel?.hotelName}</DialogTitle>
        <DialogContent>{HotelForm()}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={saving}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Hotel</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedHotel?.hotelName}</strong>?
            This will remove all associated packages and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Hotel Details</DialogTitle>
        <DialogContent dividers>
          {selectedHotel && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar src={selectedHotel.imageUrl} variant="rounded" sx={{ width: 120, height: 120, mx: 'auto', mb: 1 }}>
                  <HotelIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h6">{selectedHotel.hotelName}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedHotel.city}, {selectedHotel.stateName}</Typography>
                <Rating value={selectedHotel.starRating || 0} readOnly size="small" sx={{ mt: 0.5 }} />
              </Box>
              <Typography><strong>State:</strong> {selectedHotel.stateName || 'N/A'}</Typography>
              <Typography><strong>District:</strong> {selectedHotel.districtName || 'N/A'}</Typography>
              <Typography><strong>Address:</strong> {selectedHotel.address || 'N/A'}</Typography>
              <Typography><strong>Description:</strong> {selectedHotel.description || 'N/A'}</Typography>
              <Typography><strong>Cost per Night:</strong> ₹{selectedHotel.pricePerNight || selectedHotel.cost || '0'}</Typography>
              <Typography><strong>Contact Number:</strong> {selectedHotel.contactNumber || 'N/A'}</Typography>
              <Typography><strong>Amenities:</strong> {selectedHotel.amenities || 'N/A'}</Typography>
              <Typography><strong>Rating:</strong> ⭐ {selectedHotel.rating?.toFixed(1) || '0.0'} ({selectedHotel.reviewCount || 0} reviews)</Typography>
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

export default ManageHotels;
