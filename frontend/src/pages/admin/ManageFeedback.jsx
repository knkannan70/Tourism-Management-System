import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, InputAdornment, TextField, Chip, Tabs, Tab, FormControl, Select, MenuItem, InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  adminGetFeedback,
  adminDeleteFeedback,
  adminApproveFeedback,
  adminRejectFeedback
} from '../../api/feedbackApi';
import {
  adminGetPlaceReviews,
  adminDeletePlaceReview,
  adminApprovePlaceReview,
  adminGetHotelReviews,
  adminDeleteHotelReview,
  adminApproveHotelReview
} from '../../api/adminApi';

const ManageFeedback = () => {
  const [tabIndex, setTabIndex] = useState(0);

  // Package Feedback State
  const [feedbacks, setFeedbacks] = useState([]);
  
  // Place Reviews State
  const [placeReviews, setPlaceReviews] = useState([]);

  // Hotel Reviews State
  const [hotelReviews, setHotelReviews] = useState([]);

  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchFeedbacks = () => {
    setLoading(true);
    adminGetFeedback()
      .then((res) => {
        setFeedbacks(res.data.data || []);
        if (tabIndex === 0) setFiltered(res.data.data || []);
      })
      .catch(() => setError('Failed to load package feedbacks.'))
      .finally(() => setLoading(false));
  };

  const fetchPlaceReviews = () => {
    setLoading(true);
    adminGetPlaceReviews()
      .then((res) => {
        setPlaceReviews(res.data.data || []);
        if (tabIndex === 1) setFiltered(res.data.data || []);
      })
      .catch(() => setError('Failed to load place reviews.'))
      .finally(() => setLoading(false));
  };

  const fetchHotelReviews = () => {
    setLoading(true);
    adminGetHotelReviews()
      .then((res) => {
        setHotelReviews(res.data.data || []);
        if (tabIndex === 2) setFiltered(res.data.data || []);
      })
      .catch(() => setError('Failed to load hotel reviews.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tabIndex === 0) fetchFeedbacks();
    else if (tabIndex === 1) fetchPlaceReviews();
    else if (tabIndex === 2) fetchHotelReviews();
  }, [tabIndex]);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = [];
    if (tabIndex === 0) {
      result = feedbacks.filter((f) =>
        f.userFullName?.toLowerCase().includes(q) ||
        f.userEmail?.toLowerCase().includes(q) ||
        f.comment?.toLowerCase().includes(q) ||
        f.packageName?.toLowerCase().includes(q)
      );
    } else if (tabIndex === 1) {
      result = placeReviews.filter((r) =>
        r.userFullName?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q) ||
        r.placeName?.toLowerCase().includes(q)
      );
    } else if (tabIndex === 2) {
      result = hotelReviews.filter((r) =>
        r.userFullName?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q) ||
        r.hotelName?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return String(a.userFullName || '').localeCompare(String(b.userFullName || ''), undefined, { sensitivity: 'base' });
        case 'name_desc': return String(b.userFullName || '').localeCompare(String(a.userFullName || ''), undefined, { sensitivity: 'base' });
        case 'date_desc': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'date_asc': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'rating_desc': return (b.rating || 0) - (a.rating || 0);
        case 'rating_asc': return (a.rating || 0) - (b.rating || 0);
        default: return 0;
      }
    });

    setFiltered([...result]);
  }, [search, feedbacks, placeReviews, hotelReviews, tabIndex, sortBy]);

  const handleDelete = async () => {
    try {
      if (tabIndex === 0) {
        await adminDeleteFeedback(selectedItem.id);
        setSuccess('Package feedback deleted successfully!');
        fetchFeedbacks();
      } else if (tabIndex === 1) {
        await adminDeletePlaceReview(selectedItem.id);
        setSuccess('Place review deleted successfully!');
        fetchPlaceReviews();
      } else if (tabIndex === 2) {
        await adminDeleteHotelReview(selectedItem.id);
        setSuccess('Hotel review deleted successfully!');
        fetchHotelReviews();
      }
      setDeleteDialog(false);
    } catch (err) {
      setError('Failed to delete item.');
    }
  };

  const handleApprove = async (item) => {
    try {
      if (tabIndex === 0) {
        await adminApproveFeedback(item.id);
        setSuccess('Package feedback approved and published successfully!');
        fetchFeedbacks();
      } else if (tabIndex === 1) {
        await adminApprovePlaceReview(item.id, true);
        setSuccess('Place review approved successfully!');
        fetchPlaceReviews();
      } else if (tabIndex === 2) {
        await adminApproveHotelReview(item.id, true);
        setSuccess('Hotel review approved successfully!');
        fetchHotelReviews();
      }
    } catch (err) {
      setError('Failed to approve review/feedback.');
    }
  };

  const handleReject = async (item) => {
    try {
      if (tabIndex === 0) {
        await adminRejectFeedback(item.id);
        setSuccess('Package feedback rejected successfully!');
        fetchFeedbacks();
      } else if (tabIndex === 1) {
        await adminApprovePlaceReview(item.id, false);
        setSuccess('Place review rejected successfully!');
        fetchPlaceReviews();
      } else if (tabIndex === 2) {
        await adminApproveHotelReview(item.id, false);
        setSuccess('Hotel review rejected successfully!');
        fetchHotelReviews();
      }
    } catch (err) {
      setError('Failed to reject review/feedback.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<StarIcon key={i} sx={{ color: '#f59e0b', fontSize: 16 }} />);
      } else {
        stars.push(<StarBorderIcon key={i} sx={{ color: '#cbd5e1', fontSize: 16 }} />);
      }
    }
    return <Box sx={{ display: 'flex', alignItems: 'center' }}>{stars}</Box>;
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setSearch('');
    setError('');
    setSuccess('');
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Manage Reviews & Feedback</Typography>
        <Typography color="text.secondary">Moderate user reviews across the platform</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} sx={{ px: 2 }}>
            <Tab label="Package Feedback" />
            <Tab label="Place Reviews" />
            <Tab label="Hotel Reviews" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            <TextField
              placeholder={tabIndex === 0 ? "Search feedbacks..." : "Search reviews..."}
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
                <MenuItem value="rating_desc">Highest Rating</MenuItem>
                <MenuItem value="rating_asc">Lowest Rating</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {tabIndex === 0 ? 'Package' : tabIndex === 1 ? 'Place' : 'Hotel'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Comment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Submitted On</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.userFullName}</Typography>
                          {item.userEmail && <Typography variant="caption" color="text.secondary">{item.userEmail}</Typography>}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.packageName || item.placeName || item.hotelName || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {renderStars(item.rating)}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                          {item.comment || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {(tabIndex === 0 ? item.approved : item.isApproved) ? (
                          <Chip label="Approved" color="success" size="small" variant="outlined" />
                        ) : (
                          <Chip label="Pending" color="warning" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {!(tabIndex === 0 ? item.approved : item.isApproved) && (
                            <Button variant="outlined" color="success" size="small"
                              startIcon={<CheckCircleIcon />} onClick={() => handleApprove(item)}>
                              Approve
                            </Button>
                          )}
                          {(tabIndex === 0 ? item.approved : item.isApproved) && (
                            <Button variant="outlined" color="warning" size="small"
                              startIcon={<CancelIcon />} onClick={() => handleReject(item)}>
                              Reject
                            </Button>
                          )}
                          <Button variant="outlined" color="error" size="small"
                            startIcon={<DeleteIcon />} onClick={() => { setSelectedItem(item); setDeleteDialog(true); }}>
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Review</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review from <strong>{selectedItem?.userFullName}</strong>? This action cannot be undone.
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

export default ManageFeedback;
