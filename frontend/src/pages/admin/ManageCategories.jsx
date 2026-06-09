import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, InputAdornment, TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import {
  getCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory
} from '../../api/packageApi';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [formDialog, setFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [validationError, setValidationError] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    getCategories()
      .then((res) => {
        const data = res.data.data || [];
        setCategories(data);
        setFiltered(data);
      })
      .catch(() => setError('Failed to load categories.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(categories.filter((c) =>
      c.categoryName?.toLowerCase().includes(q)
    ));
  }, [search, categories]);

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setCategoryName('');
    setValidationError('');
    setFormDialog(true);
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setCategoryName(category.categoryName);
    setValidationError('');
    setFormDialog(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      setValidationError('Category name cannot be blank.');
      return;
    }
    try {
      if (selectedCategory) {
        // Update
        await adminUpdateCategory(selectedCategory.id, { categoryName });
        setSuccess('Category updated successfully!');
      } else {
        // Create
        await adminCreateCategory({ categoryName });
        setSuccess('Category created successfully!');
      }
      fetchCategories();
      setFormDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
    }
  };

  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await adminDeleteCategory(selectedCategory.id);
      setSuccess('Category deleted successfully!');
      fetchCategories();
      setDeleteDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category.');
      setDeleteDialog(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Manage Categories</Typography>
          <Typography color="text.secondary">{filtered.length} categories total</Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Add Category
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
            <TextField
              placeholder="Search categories..."
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
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Places Count</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{c.categoryName}</TableCell>
                      <TableCell>{c.placeCount || 0}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenEdit(c)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleOpenDelete(c)}
                            disabled={c.placeCount > 0}
                            title={c.placeCount > 0 ? "Cannot delete category with associated places" : ""}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formDialog} onClose={() => setFormDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedCategory ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              fullWidth
              error={!!validationError}
              helperText={validationError}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete category <strong>{selectedCategory?.categoryName}</strong>? This action cannot be undone.
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

export default ManageCategories;
