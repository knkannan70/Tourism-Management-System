import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Avatar, MenuItem,
  IconButton, Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, InputAdornment, Select, InputLabel, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import {
  getPackages, getPlaces, getHotels, getStates, getDistrictsByState,
  getHotelsByPlace, adminCreatePackage, adminUpdatePackage,
  adminDeletePackage, adminUploadPackageImage
} from '../../api/packageApi';

const ManagePackages = () => {
  const [packages, setPackages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [states, setStates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [form, setForm] = useState({
    packageName: '', stateId: '', districtId: '', placeId: '', hotelId: '',
    duration: '', price: 0, description: ''
  });
  const [districts, setDistricts] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [pkgsRes, placesRes, hotelsRes, statesRes] = await Promise.all([
        getPackages(), getPlaces(), getHotels(), getStates()
      ]);
      const pkgData = pkgsRes.data.data || [];
      setPackages(pkgData);
      setFiltered(pkgData);
      setAllPlaces(placesRes.data.data || []);
      setAllHotels(hotelsRes.data.data || []);
      setStates(statesRes.data.data || []);
    } catch (err) {
      setError('Failed to load package dependencies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(packages.filter((p) =>
      p.packageName?.toLowerCase().includes(q) ||
      p.place?.placeName?.toLowerCase().includes(q) ||
      p.hotel?.hotelName?.toLowerCase().includes(q)
    ));
  }, [search, packages]);

  // Cascade: State → Districts
  const handleStateChange = async (stateId) => {
    setForm(prev => ({ ...prev, stateId, districtId: '', placeId: '', hotelId: '' }));
    setDistricts([]);
    setFilteredPlaces([]);
    setFilteredHotels([]);
    if (stateId) {
      try {
        const res = await getDistrictsByState(stateId);
        setDistricts(res.data.data || []);
      } catch { setDistricts([]); }
    }
  };

  // Cascade: District → Places
  const handleDistrictChange = (districtId) => {
    setForm(prev => ({ ...prev, districtId, placeId: '', hotelId: '' }));
    setFilteredHotels([]);
    if (districtId) {
      const placesInDistrict = allPlaces.filter(
        (p) => p.districtId === districtId || p.districtId === parseInt(districtId)
      );
      setFilteredPlaces(placesInDistrict);
    } else {
      setFilteredPlaces([]);
    }
  };

  // Cascade: Place → Hotels
  const handlePlaceChange = async (placeId) => {
    setForm(prev => ({ ...prev, placeId, hotelId: '' }));
    setFilteredHotels([]);
    if (placeId) {
      try {
        const res = await getHotelsByPlace(placeId);
        setFilteredHotels(res.data.data || []);
      } catch {
        // Fallback: show all hotels in the district
        const selectedPlace = allPlaces.find(p => p.id === placeId || p.id === parseInt(placeId));
        if (selectedPlace) {
          setFilteredHotels(allHotels.filter(h =>
            h.districtId === selectedPlace.districtId || h.placeId === placeId
          ));
        }
      }
    }
  };

  const handleOpenAdd = () => {
    setForm({
      packageName: '', stateId: '', districtId: '', placeId: '', hotelId: '',
      duration: '', price: 0, description: ''
    });
    setDistricts([]);
    setFilteredPlaces([]);
    setFilteredHotels([]);
    setImageFile(null);
    setAddDialog(true);
  };

  const handleOpenEdit = async (pkg) => {
    setSelectedPackage(pkg);
    const placeData = pkg.place || {};
    const hotelData = pkg.hotel || {};
    const stateId = placeData.stateId || '';
    const districtId = placeData.districtId || '';
    const placeId = placeData.id || pkg.placeId || '';
    const hotelId = hotelData.id || pkg.hotelId || '';

    setForm({
      packageName: pkg.packageName || '',
      stateId,
      districtId,
      placeId,
      hotelId,
      duration: pkg.duration || '',
      price: pkg.price || 0,
      description: pkg.description || ''
    });

    // Pre-populate cascading dropdowns for editing
    if (stateId) {
      try {
        const res = await getDistrictsByState(stateId);
        setDistricts(res.data.data || []);
      } catch { setDistricts([]); }
    }

    if (districtId) {
      const placesInDistrict = allPlaces.filter(
        (p) => p.districtId === districtId || p.districtId === parseInt(districtId)
      );
      setFilteredPlaces(placesInDistrict);
    }

    if (placeId) {
      try {
        const res = await getHotelsByPlace(placeId);
        setFilteredHotels(res.data.data || []);
      } catch {
        setFilteredHotels(allHotels.filter(h =>
          h.districtId === districtId || h.placeId === placeId
        ));
      }
    }

    setImageFile(null);
    setEditDialog(true);
  };

  const handleCreate = async () => {
    if (!form.packageName || !form.placeId || !form.hotelId || !form.duration || form.price < 0) {
      setError('Please fill in all required fields correctly.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        placeId: form.placeId || null,
        hotelId: form.hotelId || null,
      };
      const res = await adminCreatePackage(payload);
      const createdPkg = res.data.data;
      
      let imageError = false;
      try {
        if (imageFile) {
          await adminUploadPackageImage(createdPkg.id, imageFile);
        }
      } catch (imgErr) {
        imageError = true;
      }

      if (imageError) {
        setSuccess('Package added, but image upload failed (check GitHub token).');
      } else {
        setSuccess('Package added successfully!');
      }
      loadData();
      setAddDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add package.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.packageName || !form.placeId || !form.hotelId || !form.duration || form.price < 0) {
      setError('Please fill in all required fields correctly.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        placeId: form.placeId || null,
        hotelId: form.hotelId || null,
      };
      await adminUpdatePackage(selectedPackage.id, payload);
      
      let imageError = false;
      try {
        if (imageFile) {
          await adminUploadPackageImage(selectedPackage.id, imageFile);
        }
      } catch (imgErr) {
        imageError = true;
      }

      if (imageError) {
        setSuccess('Package updated, but image upload failed.');
      } else {
        setSuccess('Package updated successfully!');
      }
      loadData();
      setEditDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update package.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminDeletePackage(selectedPackage.id);
      setSuccess('Package deleted successfully!');
      loadData();
      setDeleteDialog(false);
    } catch (err) {
      setError('Failed to delete package.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Shared form fields for both Add and Edit dialogs
  const renderFormFields = () => (
    <>
      <TextField
        label="Package Name"
        value={form.packageName}
        onChange={(e) => setForm({ ...form, packageName: e.target.value })}
        fullWidth
        required
      />

      {/* Step 1: Select State */}
      <FormControl fullWidth required>
        <InputLabel>Select State</InputLabel>
        <Select
          value={form.stateId}
          label="Select State"
          onChange={(e) => handleStateChange(e.target.value)}
        >
          {states.map((s) => (
            <MenuItem key={s.id} value={s.id}>{s.stateName}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Step 2: Select District */}
      <FormControl fullWidth required disabled={!form.stateId}>
        <InputLabel>Select District</InputLabel>
        <Select
          value={form.districtId}
          label="Select District"
          onChange={(e) => handleDistrictChange(e.target.value)}
        >
          {districts.length === 0 ? (
            <MenuItem value="" disabled>
              {form.stateId ? 'No districts found' : 'Select a state first'}
            </MenuItem>
          ) : (
            districts.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.districtName}</MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {/* Step 3: Select Place */}
      <FormControl fullWidth required disabled={!form.districtId}>
        <InputLabel>Select Place (Destination)</InputLabel>
        <Select
          value={form.placeId}
          label="Select Place (Destination)"
          onChange={(e) => handlePlaceChange(e.target.value)}
        >
          {filteredPlaces.length === 0 ? (
            <MenuItem value="" disabled>
              {form.districtId ? 'No places found in this district' : 'Select a district first'}
            </MenuItem>
          ) : (
            filteredPlaces.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.placeName} ({p.region})</MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {/* Step 4: Select Hotel (filtered by Place) */}
      <FormControl fullWidth required disabled={!form.placeId}>
        <InputLabel>Select Hotel (Accommodation)</InputLabel>
        <Select
          value={form.hotelId}
          label="Select Hotel (Accommodation)"
          onChange={(e) => setForm({ ...form, hotelId: e.target.value })}
        >
          {filteredHotels.length === 0 ? (
            <MenuItem value="" disabled>
              {form.placeId ? 'No hotels found for this place' : 'Select a place first'}
            </MenuItem>
          ) : (
            filteredHotels.map((h) => (
              <MenuItem key={h.id} value={h.id}>{h.hotelName} ({h.city})</MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Duration (e.g. 5 Days / 4 Nights)"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          fullWidth
          required
        />
        <TextField
          label="Package Price (₹)"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
          fullWidth
          required
        />
      </Box>
      <TextField
        label="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        multiline
        rows={3}
        fullWidth
      />
      <Box>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Upload Package Image</Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{ py: 1.5, borderStyle: 'dashed', borderColor: '#94a3b8' }}
        >
          Choose Image File
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Button>
        {imageFile && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'primary.main' }}>
            Selected: {imageFile.name}
          </Typography>
        )}
      </Box>
    </>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Manage Packages</Typography>
          <Typography color="text.secondary">{filtered.length} packages total</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Add Package
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
            <TextField
              placeholder="Search packages..."
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
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Package</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Destination</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Hotel Option</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((pkg) => (
                  <TableRow key={pkg.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={pkg.imageUrl}
                          variant="rounded"
                          sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}
                        >
                          <CardTravelIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{pkg.packageName}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pkg.description || 'No description provided'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{pkg.place?.placeName || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{pkg.hotel?.hotelName || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{pkg.duration}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{(pkg.price || 0).toLocaleString('en-IN')}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEdit(pkg)} sx={{ color: 'primary.main' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => { setSelectedPackage(pkg); setDeleteDialog(true); }}
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

      {/* Add Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Package</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          {renderFormFields()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            {saving ? 'Adding...' : 'Add Package'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Package</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          {renderFormFields()}
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Package</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete package <strong>{selectedPackage?.packageName}</strong>? This action will remove all linked bookings and cannot be undone.
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

export default ManagePackages;
