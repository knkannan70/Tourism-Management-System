import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Avatar,
  IconButton, Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, InputAdornment, MenuItem, FormControl,
  InputLabel, Select, Chip, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LandscapeIcon from '@mui/icons-material/Landscape';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  getPlaces, getCategories, getStates, getDistrictsByState,
  adminCreatePlace, adminUpdatePlace, adminDeletePlace, adminUploadPlaceImage, adminUploadPlaceGalleryImage
} from '../../api/packageApi';

const EMPTY_FORM = {
  placeName: '', region: '', season: '', days: 1, cost: 0, description: '',
  categoryId: '', stateId: '', districtId: '', location: '',
  latitude: '', longitude: '', bestTime: '', entryFee: 0,
  openingTime: '09:00 AM', closingTime: '06:00 PM',
  nearbyAttractions: '', travelTips: '', popularActivities: '',
  videoUrl: '', googleMapsUrl: ''
};

const ManagePlaces = () => {
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filterState, setFilterState] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formDistricts, setFormDistricts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchPlaces = async () => {
    try {
      const res = await getPlaces();
      const data = res.data.data || [];
      setPlaces(data);
      setFiltered(data);
    } catch {
      setError('Failed to load places.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
    getCategories().then(r => setCategories(r.data.data || []));
    getStates().then(r => setStates(r.data.data || []));
  }, []);

  // Filter places by search / state / category
  useEffect(() => {
    let result = [...places];
    const q = search.toLowerCase();
    if (q) {
      result = result.filter(p =>
        p.placeName?.toLowerCase().includes(q) ||
        p.region?.toLowerCase().includes(q) ||
        p.stateName?.toLowerCase().includes(q) ||
        p.districtName?.toLowerCase().includes(q)
      );
    }
    if (filterState) result = result.filter(p => String(p.stateId) === String(filterState));
    if (filterCategory) result = result.filter(p => String(p.categoryId) === String(filterCategory));

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return String(a.placeName || '').localeCompare(String(b.placeName || ''), undefined, { sensitivity: 'base' });
        case 'name_desc': return String(b.placeName || '').localeCompare(String(a.placeName || ''), undefined, { sensitivity: 'base' });
        case 'rating_desc': return (b.rating || 0) - (a.rating || 0);
        case 'rating_asc': return (a.rating || 0) - (b.rating || 0);
        case 'date_desc': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'date_asc': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default: return 0;
      }
    });

    setFiltered([...result]);
  }, [search, places, filterState, filterCategory, sortBy]);

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

  const handleOpenEdit = (place) => {
    setSelectedPlace(place);
    setForm({
      placeName: place.placeName || '',
      region: place.region || '',
      season: place.season || '',
      days: place.days || 1,
      cost: place.cost || 0,
      description: place.description || '',
      categoryId: place.categoryId || '',
      stateId: place.stateId || '',
      districtId: place.districtId || '',
      location: place.location || '',
      latitude: place.latitude || '',
      longitude: place.longitude || '',
      bestTime: place.bestTime || '',
      entryFee: place.entryFee || 0,
      openingTime: place.openingTime || '09:00 AM',
      closingTime: place.closingTime || '06:00 PM',
      nearbyAttractions: place.nearbyAttractions || '',
      travelTips: place.travelTips || '',
      popularActivities: place.popularActivities || '',
      videoUrl: place.videoUrl || '',
      googleMapsUrl: place.googleMapsUrl || '',
    });
    if (place.stateId) loadDistrictsForState(place.stateId);
    setImageFile(null);
    setGalleryFiles([]);
    setEditDialog(true);
  };

  const handleStateChange = (stateId) => {
    setForm(f => ({ ...f, stateId, districtId: '' }));
    loadDistrictsForState(stateId);
  };

  const handleCreate = async () => {
    if (!form.placeName || !form.region) {
      setError('Place Name and Region are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId || null,
        stateId: form.stateId || null,
        districtId: form.districtId || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      const res = await adminCreatePlace(payload);
      const createdPlace = res.data.data;
      
      let imageError = false;
      try {
        if (imageFile) {
          await adminUploadPlaceImage(createdPlace.id, imageFile);
        }
        if (galleryFiles.length > 0) {
          await Promise.all(galleryFiles.map(file => adminUploadPlaceGalleryImage(createdPlace.id, file)));
        }
      } catch (imgErr) {
        imageError = true;
      }
      
      if (imageError) {
        setSuccess('Place added, but image upload failed (check GitHub token).');
      } else {
        setSuccess('Place added successfully!');
      }
      fetchPlaces();
      setAddDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add place.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.placeName || !form.region) {
      setError('Place Name and Region are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId || null,
        stateId: form.stateId || null,
        districtId: form.districtId || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      await adminUpdatePlace(selectedPlace.id, payload);
      
      let imageError = false;
      try {
        if (imageFile) {
          await adminUploadPlaceImage(selectedPlace.id, imageFile);
        }
        if (galleryFiles.length > 0) {
          await Promise.all(galleryFiles.map(file => adminUploadPlaceGalleryImage(selectedPlace.id, file)));
        }
      } catch (imgErr) {
        imageError = true;
      }

      if (imageError) {
        setSuccess('Place updated, but image upload failed.');
      } else {
        setSuccess('Place updated successfully!');
      }
      fetchPlaces();
      setEditDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update place.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminDeletePlace(selectedPlace.id);
      setSuccess('Place deleted successfully!');
      fetchPlaces();
      setDeleteDialog(false);
    } catch {
      setError('Failed to delete place. It may have linked packages/bookings.');
    }
  };

  const PlaceForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={8}>
          <TextField label="Place Name *" value={form.placeName}
            onChange={e => setForm(f => ({ ...f, placeName: e.target.value }))} fullWidth />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Region / Area" value={form.region}
            onChange={e => setForm(f => ({ ...f, region: e.target.value }))} fullWidth />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>State</InputLabel>
            <Select value={form.stateId} label="State"
              onChange={e => handleStateChange(e.target.value)}>
              <MenuItem value="">-- Any State --</MenuItem>
              {states.map(s => <MenuItem key={s.id} value={s.id}>{s.stateName}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>District</InputLabel>
            <Select value={form.districtId} label="District"
              onChange={e => setForm(f => ({ ...f, districtId: e.target.value }))}
              disabled={!form.stateId}>
              <MenuItem value="">-- Any District --</MenuItem>
              {formDistricts.map(d => <MenuItem key={d.id} value={d.id}>{d.districtName}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={form.categoryId} label="Category"
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <MenuItem value="">-- Any Category --</MenuItem>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.categoryName}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TextField label="Description" value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        multiline rows={2} fullWidth />

      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <TextField label="Duration (Days)" type="number" value={form.days}
            onChange={e => setForm(f => ({ ...f, days: parseInt(e.target.value) || 1 }))} fullWidth />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="Base Cost (₹)" type="number" value={form.cost}
            onChange={e => setForm(f => ({ ...f, cost: parseFloat(e.target.value) || 0 }))} fullWidth />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="Entry Fee (₹)" type="number" value={form.entryFee}
            onChange={e => setForm(f => ({ ...f, entryFee: parseFloat(e.target.value) || 0 }))} fullWidth />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="Best Season" value={form.season}
            onChange={e => setForm(f => ({ ...f, season: e.target.value }))} fullWidth />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField label="Opening Time" value={form.openingTime}
            onChange={e => setForm(f => ({ ...f, openingTime: e.target.value }))} fullWidth
            placeholder="e.g. 09:00 AM" />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Closing Time" value={form.closingTime}
            onChange={e => setForm(f => ({ ...f, closingTime: e.target.value }))} fullWidth
            placeholder="e.g. 06:00 PM" />
        </Grid>
      </Grid>

      <TextField label="Best Time to Visit" value={form.bestTime}
        onChange={e => setForm(f => ({ ...f, bestTime: e.target.value }))} fullWidth
        placeholder="e.g. October to March" />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField label="Location / Address" value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))} fullWidth />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField label="Latitude" type="number" value={form.latitude}
            onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} fullWidth />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField label="Longitude" type="number" value={form.longitude}
            onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} fullWidth />
        </Grid>
      </Grid>

      <TextField label="Nearby Attractions" value={form.nearbyAttractions}
        onChange={e => setForm(f => ({ ...f, nearbyAttractions: e.target.value }))}
        multiline rows={2} fullWidth placeholder="Comma-separated list of nearby attractions" />

      <TextField label="Travel Tips" value={form.travelTips}
        onChange={e => setForm(f => ({ ...f, travelTips: e.target.value }))}
        multiline rows={2} fullWidth />

      <TextField label="Popular Activities" value={form.popularActivities}
        onChange={e => setForm(f => ({ ...f, popularActivities: e.target.value }))}
        fullWidth placeholder="Sightseeing, Photography, Trekking..." />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="Google Maps Embed URL" value={form.googleMapsUrl}
            onChange={e => setForm(f => ({ ...f, googleMapsUrl: e.target.value }))} fullWidth />
        </Grid>
      </Grid>

      <Box>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Main Place Image (Cover)</Typography>
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
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Manage Places</Typography>
          <Typography color="text.secondary">{filtered.length} of {places.length} destinations</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
          Add Place
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {/* Search + Filters */}
          <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
            <TextField placeholder="Search places..." value={search}
              onChange={e => setSearch(e.target.value)} size="small" sx={{ width: 260 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment> }} />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by State</InputLabel>
              <Select value={filterState} label="Filter by State"
                onChange={e => setFilterState(e.target.value)}>
                <MenuItem value="">All States</MenuItem>
                {states.map(s => <MenuItem key={s.id} value={s.id}>{s.stateName}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Filter by Category</InputLabel>
              <Select value={filterCategory} label="Filter by Category"
                onChange={e => setFilterCategory(e.target.value)}>
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.categoryName}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
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
            {(filterState || filterCategory || sortBy !== 'name_asc') && (
              <Button size="small" variant="outlined" onClick={() => { setFilterState(''); setFilterCategory(''); setSortBy('name_asc'); }}>
                Clear Filters
              </Button>
            )}
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Place</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>State / District</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Entry Fee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((place) => (
                  <TableRow key={place.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={place.imageUrl} variant="rounded"
                          sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                          <LandscapeIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{place.placeName}</Typography>
                          <Typography variant="caption" color="text.secondary">{place.region}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{place.stateName || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">{place.districtName || ''}</Typography>
                    </TableCell>
                    <TableCell>
                      {place.categoryName ? (
                        <Chip label={place.categoryName} size="small" sx={{ bgcolor: 'rgba(225, 29, 72, 0.1)', color: 'primary.main' }} />
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {place.entryFee > 0 ? `₹${place.entryFee}` : 'Free'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                        <Typography variant="body2">{place.rating?.toFixed(1) || '0.0'}</Typography>
                        <Typography variant="caption" color="text.secondary">({place.reviewCount || 0})</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => { setSelectedPlace(place); setViewDialog(true); }} sx={{ color: '#0ea5e9' }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEdit(place)} sx={{ color: 'primary.main' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small"
                          onClick={() => { setSelectedPlace(place); setDeleteDialog(true); }}
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
                      No places found matching the current filters.
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
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Tourist Place</DialogTitle>
        <DialogContent>{PlaceForm()}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
            {saving ? 'Adding...' : 'Add Place'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Place: {selectedPlace?.placeName}</DialogTitle>
        <DialogContent>{PlaceForm()}</DialogContent>
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
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Place</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedPlace?.placeName}</strong>?
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
        <DialogTitle sx={{ fontWeight: 700 }}>Place Details</DialogTitle>
        <DialogContent dividers>
          {selectedPlace && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar src={selectedPlace.imageUrl} variant="rounded" sx={{ width: 120, height: 120, mx: 'auto', mb: 1 }}>
                  <LandscapeIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h6">{selectedPlace.placeName}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedPlace.region}</Typography>
              </Box>
              <Typography><strong>State:</strong> {selectedPlace.stateName || 'N/A'}</Typography>
              <Typography><strong>District:</strong> {selectedPlace.districtName || 'N/A'}</Typography>
              <Typography><strong>Category:</strong> {selectedPlace.categoryName || 'N/A'}</Typography>
              <Typography><strong>Description:</strong> {selectedPlace.description || 'N/A'}</Typography>
              <Typography><strong>Entry Fee:</strong> {selectedPlace.entryFee > 0 ? `₹${selectedPlace.entryFee}` : 'Free'}</Typography>
              <Typography><strong>Best Time:</strong> {selectedPlace.bestTime || 'N/A'}</Typography>
              <Typography><strong>Timings:</strong> {selectedPlace.openingTime || 'N/A'} - {selectedPlace.closingTime || 'N/A'}</Typography>
              <Typography><strong>Coordinates:</strong> {selectedPlace.latitude || 'N/A'}, {selectedPlace.longitude || 'N/A'}</Typography>
              <Typography><strong>Rating:</strong> ⭐ {selectedPlace.rating?.toFixed(1) || '0.0'} ({selectedPlace.reviewCount || 0} reviews)</Typography>
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

export default ManagePlaces;
