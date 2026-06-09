import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia,
  TextField, InputAdornment, MenuItem, FormControl, InputLabel, Select,
  Chip, Button, Avatar, CircularProgress, Rating, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SendIcon from '@mui/icons-material/Send';
import HotelIcon from '@mui/icons-material/Hotel';
import WifiIcon from '@mui/icons-material/Wifi';
import Alert from '@mui/material/Alert';
import { getHotels, getHotelReviews, addHotelReview } from '../api/hotelApi';
import { getStates, getDistrictsByState } from '../api/packageApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HotelsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelReviews, setHotelReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    Promise.all([
      getHotels().then(r => r.data.data || []),
      getStates().then(r => r.data.data || []),
    ]).then(([hotelsData, statesData]) => {
      setHotels(hotelsData);
      setFiltered(hotelsData);
      setStates(statesData);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...hotels];
    const q = search.toLowerCase();
    if (q) result = result.filter(h =>
      h.hotelName?.toLowerCase().includes(q) ||
      h.city?.toLowerCase().includes(q) ||
      h.stateName?.toLowerCase().includes(q)
    );
    if (filterState) result = result.filter(h => String(h.stateId) === String(filterState));
    if (filterDistrict) result = result.filter(h => String(h.districtId) === String(filterDistrict));

    // Sort logic
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return String(a.hotelName || '').localeCompare(String(b.hotelName || ''), undefined, { sensitivity: 'base' });
        case 'name_desc': return String(b.hotelName || '').localeCompare(String(a.hotelName || ''), undefined, { sensitivity: 'base' });
        case 'rating_desc': return (b.rating || 0) - (a.rating || 0);
        case 'rating_asc': return (a.rating || 0) - (b.rating || 0);
        case 'price_asc': return (a.pricePerNight || a.cost || 0) - (b.pricePerNight || b.cost || 0);
        case 'price_desc': return (b.pricePerNight || b.cost || 0) - (a.pricePerNight || a.cost || 0);
        case 'reviews_desc': return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'booked_desc': return (b.bookingCount || 0) - (a.bookingCount || 0);
        case 'date_desc': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'date_asc': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default: return 0;
      }
    });

    setFiltered(result);
  }, [search, hotels, filterState, filterDistrict, sortBy]);

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

  const openReviewDialog = async (hotel) => {
    setSelectedHotel(hotel);
    setMyRating(0);
    setMyComment('');
    setReviewError('');
    try {
      const res = await getHotelReviews(hotel.id);
      setHotelReviews(res.data.data || []);
    } catch { setHotelReviews([]); }
    setReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!myRating) { setReviewError('Please select a rating.'); return; }
    setSubmittingReview(true);
    setReviewError('');
    try {
      await addHotelReview(selectedHotel.id, { rating: myRating, comment: myComment });
      const res = await getHotelReviews(selectedHotel.id);
      setHotelReviews(res.data.data || []);
      const hotelsRes = await getHotels();
      const updated = hotelsRes.data.data || [];
      setHotels(updated);
      setMyRating(0);
      setMyComment('');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (count) => '⭐'.repeat(Math.min(count || 3, 5));

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
        background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08), #ffffff)',
        py: 6, mb: 4,
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, fontFamily: '"Outfit", sans-serif' }}>
            Find Hotels 🏨
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            Browse {hotels.length}+ hotels across India with guest reviews
          </Typography>
          <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField placeholder="Search hotels, city, state..." value={search}
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
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={e => setSortBy(e.target.value)}>
                <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                <MenuItem value="rating_desc">Highest Rating</MenuItem>
                <MenuItem value="rating_asc">Lowest Rating</MenuItem>
                <MenuItem value="reviews_desc">Most Reviewed</MenuItem>
                <MenuItem value="booked_desc">Most Booked</MenuItem>
                <MenuItem value="price_asc">Price (Low-High)</MenuItem>
                <MenuItem value="price_desc">Price (High-Low)</MenuItem>
                <MenuItem value="date_desc">Recently Added</MenuItem>
                <MenuItem value="date_asc">Oldest First</MenuItem>
              </Select>
            </FormControl>
            {(filterState || filterDistrict || search || sortBy !== 'name_asc') && (
              <Button variant="outlined" size="small"
                onClick={() => { setFilterState(''); setFilterDistrict(''); setSearch(''); setDistricts([]); setSortBy('name_asc'); }}>
                Clear
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Showing <strong>{filtered.length}</strong> hotels
        </Typography>

        <Grid container spacing={3}>
          {filtered.map((hotel) => (
            <Grid item xs={12} sm={6} md={4} key={hotel.id}>
              <Card sx={{
                height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer',
                '& .card-img': { transition: 'transform 0.5s ease' },
                '&:hover .card-img': { transform: 'scale(1.08)' }
              }} onClick={() => navigate(`/hotels/${hotel.id}`)}>
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    className="card-img"
                    component="img" height="220"
                    image={hotel.imageUrl || `https://picsum.photos/seed/hotel${hotel.id}/400/200`}
                    alt={hotel.hotelName}
                    onError={e => { e.target.src = `https://picsum.photos/seed/hotel${hotel.id}/400/200`; }}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      {hotel.hotelName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem' }}>{renderStars(hotel.starRating)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <PlaceIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                    <Typography variant="caption" color="text.secondary">
                      {[hotel.city, hotel.stateName].filter(Boolean).join(', ')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {hotel.description || 'A comfortable stay for your journey.'}
                  </Typography>
                  {hotel.amenities && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontStyle: 'italic' }}>
                      ✓ {hotel.amenities.split(',').slice(0, 3).join(' · ')}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{hotel.rating?.toFixed(1) || '0.0'}</Typography>
                      <Typography variant="caption" color="text.secondary">({hotel.reviewCount || 0})</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ₹{(hotel.pricePerNight || hotel.cost || 0).toLocaleString('en-IN')}/night
                    </Typography>
                  </Box>
                </CardContent>
                {user && (
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth variant="outlined" size="small" startIcon={<RateReviewIcon />}
                      onClick={(e) => { e.stopPropagation(); openReviewDialog(hotel); }}
                      sx={{ color: '#1a4db3', borderColor: '#1a4db3', '&:hover': { bgcolor: '#eff6ff' } }}>
                      View Reviews & Rate
                    </Button>
                  </Box>
                )}
                {!user && (
                   <Box sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth variant="contained" size="small"
                      sx={{ bgcolor: '#1a4db3', '&:hover': { bgcolor: '#1239a0' } }}>
                      View Details
                    </Button>
                   </Box>
                )}
              </Card>
            </Grid>
          ))}
          {filtered.length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ textAlign: 'center', py: 8 }}>
                <HotelIcon sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No hotels found</Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Reviews Dialog */}
      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{selectedHotel?.hotelName} — Reviews</DialogTitle>
        <DialogContent>
          {user && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Write Your Review</Typography>
              {reviewError && <Alert severity="error" sx={{ mb: 1 }}>{reviewError}</Alert>}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="body2">Your Rating:</Typography>
                <Rating value={myRating} onChange={(_, v) => setMyRating(v)} size="large" />
              </Box>
              <TextField fullWidth multiline rows={2} size="small"
                placeholder="Share your experience at this hotel..."
                value={myComment} onChange={e => setMyComment(e.target.value)} sx={{ mb: 1.5 }} />
              <Button variant="contained" size="small" endIcon={<SendIcon />}
                onClick={handleSubmitReview} disabled={submittingReview}
                sx={{ bgcolor: '#1a4db3', '&:hover': { bgcolor: '#1239a0' } }}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </Paper>
          )}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>All Reviews ({hotelReviews.length})</Typography>
          {hotelReviews.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No reviews yet. Be the first!</Typography>
          ) : (
            hotelReviews.map((review, i) => (
              <Box key={review.id}>
                <Box sx={{ display: 'flex', gap: 1.5, py: 1.5 }}>
                  <Avatar src={review.userProfileImage} sx={{ width: 36, height: 36, bgcolor: '#1a4db3', fontSize: '0.85rem' }}>
                    {review.userFullName?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{review.userFullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString('en-IN')}
                      </Typography>
                    </Box>
                    <Rating value={review.rating} readOnly size="small" />
                    {review.comment && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{review.comment}</Typography>}
                  </Box>
                </Box>
                {i < hotelReviews.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setReviewDialog(false)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default HotelsPage;
