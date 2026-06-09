import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia,
  TextField, InputAdornment, MenuItem, FormControl, InputLabel, Select,
  Chip, Button, Avatar, CircularProgress, Alert, Rating, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoneyIcon from '@mui/icons-material/Money';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SendIcon from '@mui/icons-material/Send';
import { getPlaces, getPlaceReviews, addPlaceReview } from '../api/placeApi';
import { getCategories, getStates, getDistrictsByState } from '../api/packageApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PlacesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  // Review dialog
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeReviews, setPlaceReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    Promise.all([
      getPlaces().then(r => r.data.data || []),
      getCategories().then(r => r.data.data || []),
      getStates().then(r => r.data.data || []),
    ]).then(([placesData, catsData, statesData]) => {
      setPlaces(placesData);
      setFiltered(placesData);
      setCategories(catsData);
      setStates(statesData);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...places];
    const q = search.toLowerCase();
    if (q) {
      result = result.filter(p =>
        p.placeName?.toLowerCase().includes(q) ||
        p.region?.toLowerCase().includes(q) ||
        p.stateName?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q)
      );
    }
    if (filterState) result = result.filter(p => String(p.stateId) === String(filterState));
    if (filterDistrict) result = result.filter(p => String(p.districtId) === String(filterDistrict));
    if (filterCategory) result = result.filter(p => String(p.categoryId) === String(filterCategory));
    
    // Sort logic
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return String(a.placeName || '').localeCompare(String(b.placeName || ''), undefined, { sensitivity: 'base' });
        case 'name_desc': return String(b.placeName || '').localeCompare(String(a.placeName || ''), undefined, { sensitivity: 'base' });
        case 'rating_desc': return (b.rating || 0) - (a.rating || 0);
        case 'rating_asc': return (a.rating || 0) - (b.rating || 0);
        case 'price_asc': return (a.entryFee || 0) - (b.entryFee || 0);
        case 'price_desc': return (b.entryFee || 0) - (a.entryFee || 0);
        case 'reviews_desc': return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'booked_desc': return (b.bookingCount || 0) - (a.bookingCount || 0);
        case 'date_desc': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'date_asc': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default: return 0;
      }
    });
    
    setFiltered(result);
  }, [search, places, filterState, filterDistrict, filterCategory, sortBy]);

  const handleStateFilter = async (stateId) => {
    setFilterState(stateId);
    setFilterDistrict('');
    if (stateId) {
      const res = await getDistrictsByState(stateId);
      setDistricts(res.data.data || []);
    } else {
      setDistricts([]);
    }
  };

  const openReviewDialog = async (place) => {
    setSelectedPlace(place);
    setMyRating(0);
    setMyComment('');
    setReviewError('');
    try {
      const res = await getPlaceReviews(place.id);
      setPlaceReviews(res.data.data || []);
    } catch { setPlaceReviews([]); }
    setReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!myRating) { setReviewError('Please select a rating.'); return; }
    setSubmittingReview(true);
    setReviewError('');
    try {
      await addPlaceReview(selectedPlace.id, { rating: myRating, comment: myComment });
      const res = await getPlaceReviews(selectedPlace.id);
      setPlaceReviews(res.data.data || []);
      // Refresh place list to update rating
      const placesRes = await getPlaces();
      const updated = placesRes.data.data || [];
      setPlaces(updated);
      setMyRating(0);
      setMyComment('');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const clearFilters = () => {
    setFilterState('');
    setFilterDistrict('');
    setFilterCategory('');
    setSearch('');
    setDistricts([]);
    setSortBy('name_asc');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 6 }}>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, #ffffff 100%)',
        py: 6, mb: 4,
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, fontFamily: '"Outfit", sans-serif' }}>
            Explore Tourist Places 🗺️
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            Discover {places.length}+ amazing destinations across India
          </Typography>
          <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField placeholder="Search places, states, categories..." value={search}
              onChange={e => setSearch(e.target.value)} size="small" sx={{ flexGrow: 1, minWidth: 200 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment> }} />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>State</InputLabel>
              <Select value={filterState} label="State" onChange={e => handleStateFilter(e.target.value)}>
                <MenuItem value="">All States</MenuItem>
                {states.map(s => <MenuItem key={s.id} value={s.id}>{s.stateName}</MenuItem>)}
              </Select>
            </FormControl>
            {districts.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>District</InputLabel>
                <Select value={filterDistrict} label="District" onChange={e => setFilterDistrict(e.target.value)}>
                  <MenuItem value="">All Districts</MenuItem>
                  {districts.map(d => <MenuItem key={d.id} value={d.id}>{d.districtName}</MenuItem>)}
                </Select>
              </FormControl>
            )}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select value={filterCategory} label="Category" onChange={e => setFilterCategory(e.target.value)}>
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
                <MenuItem value="reviews_desc">Most Reviewed</MenuItem>
                <MenuItem value="booked_desc">Most Booked</MenuItem>
                <MenuItem value="price_asc">Entry Fee (Low-High)</MenuItem>
                <MenuItem value="price_desc">Entry Fee (High-Low)</MenuItem>
                <MenuItem value="date_desc">Recently Added</MenuItem>
                <MenuItem value="date_asc">Oldest First</MenuItem>
              </Select>
            </FormControl>
            {(filterState || filterCategory || filterDistrict || search || sortBy !== 'name_asc') && (
              <Button variant="outlined" size="small" onClick={clearFilters} sx={{ whiteSpace: 'nowrap' }}>
                Clear All
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography color="text.secondary">
            Showing <strong>{filtered.length}</strong> places
            {filterState && states.find(s => s.id == filterState) && ` in ${states.find(s => s.id == filterState)?.stateName}`}
            {filterCategory && categories.find(c => c.id == filterCategory) && ` — ${categories.find(c => c.id == filterCategory)?.categoryName}`}
          </Typography>
        </Box>

        {filtered.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">No places found</Typography>
            <Button variant="text" sx={{ color: 'primary.main', mt: 1 }} onClick={clearFilters}>Clear Filters</Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((place) => (
              <Grid item xs={12} sm={6} md={4} key={place.id}>
                <Card sx={{
                  height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer',
                  '& .card-img': { transition: 'transform 0.5s ease' },
                  '&:hover .card-img': { transform: 'scale(1.08)' }
                }} onClick={() => navigate(`/places/${place.id}`)}>
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      className="card-img"
                      component="img"
                      height="220"
                      image={place.imageUrl || `https://picsum.photos/seed/${place.id}/400/200`}
                      alt={place.placeName}
                      onError={e => { e.target.src = `https://picsum.photos/seed/${place.id}/400/200`; }}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      height: '50%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
                      pointerEvents: 'none'
                    }} />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', flexGrow: 1, pr: 1 }}>
                        {place.placeName}
                      </Typography>
                      {place.categoryName && (
                        <Chip label={place.categoryName} size="small" sx={{ bgcolor: 'rgba(225, 29, 72, 0.05)', color: 'primary.main', fontSize: '0.65rem' }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <PlaceIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                      <Typography variant="caption" color="text.secondary">
                        {[place.districtName, place.stateName].filter(Boolean).join(', ') || place.region}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {place.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                      {place.openingTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                          <Typography variant="caption" color="text.secondary">{place.openingTime} - {place.closingTime}</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{place.rating?.toFixed(1) || '0.0'}</Typography>
                        <Typography variant="caption" color="text.secondary">({place.reviewCount || 0} reviews)</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MoneyIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {place.entryFee > 0 ? `₹${place.entryFee} entry` : 'Free entry'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  {user && (
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Button
                        fullWidth variant="outlined" size="small"
                        startIcon={<RateReviewIcon />}
                        onClick={(e) => { e.stopPropagation(); openReviewDialog(place); }}
                        sx={{ color: 'primary.main', borderColor: 'primary.main', '&:hover': { bgcolor: 'rgba(225, 29, 72, 0.05)' } }}
                      >
                        View Reviews & Rate
                      </Button>
                    </Box>
                  )}
                  {!user && (
                     <Box sx={{ px: 2, pb: 2 }}>
                      <Button
                        fullWidth variant="contained" size="small"
                        sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                      >
                        View Details
                      </Button>
                     </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Reviews Dialog */}
      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedPlace?.placeName} — Reviews
        </DialogTitle>
        <DialogContent>
          {user && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Write Your Review</Typography>
              {reviewError && <Alert severity="error" sx={{ mb: 1 }}>{reviewError}</Alert>}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="body2">Your Rating:</Typography>
                <Rating value={myRating} onChange={(_, v) => setMyRating(v)} size="large" />
              </Box>
              <TextField
                fullWidth multiline rows={2} size="small"
                placeholder="Share your experience..."
                value={myComment}
                onChange={e => setMyComment(e.target.value)}
                sx={{ mb: 1.5 }}
              />
              <Button variant="contained" size="small" endIcon={<SendIcon />}
                onClick={handleSubmitReview} disabled={submittingReview}
                sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </Paper>
          )}

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
            All Reviews ({placeReviews.length})
          </Typography>
          {placeReviews.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No reviews yet. Be the first to review!
            </Typography>
          ) : (
            placeReviews.map((review, i) => (
              <Box key={review.id}>
                <Box sx={{ display: 'flex', gap: 1.5, py: 1.5 }}>
                  <Avatar src={review.userProfileImage} sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                    {review.userFullName?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{review.userFullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString('en-IN')}
                      </Typography>
                    </Box>
                    <Rating value={review.rating} readOnly size="small" />
                    {review.comment && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{review.comment}</Typography>
                    )}
                  </Box>
                </Box>
                {i < placeReviews.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlacesPage;
