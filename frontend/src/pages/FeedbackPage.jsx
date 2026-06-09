import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Grid,
  TextField, MenuItem, Button, Alert, Rating, Divider,
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { submitFeedback, getAllFeedback } from '../api/feedbackApi';
import { getMyBookings } from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const FeedbackPage = () => {
  const { user } = useAuth();
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    bookingId: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    Promise.all([getAllFeedback(), getMyBookings()])
      .then(([fbRes, bkRes]) => {
        const allFb = fbRes.data.data || [];
        setMyFeedbacks(allFb.filter((f) => f.userId === user?.id));
        // Filter to confirmed or completed bookings only
        const eligibleBookings = (bkRes.data.data || []).filter(
          (b) => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED'
              || b.status === 'CONFIRMED' || b.status === 'COMPLETED'
        );
        setBookings(eligibleBookings);
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, [user]);

  const getBookingDisplayName = (booking) => {
    const pkgName = booking.packageName
      || booking.tourPackage?.packageName
      || 'Package';
    const placeName = booking.placeName
      || booking.tourPackage?.place?.placeName
      || '';
    const date = booking.bookingDate
      ? new Date(booking.bookingDate).toLocaleDateString('en-IN')
      : '';
    return `${pkgName}${placeName ? ' - ' + placeName : ''}${date ? ' (' + date + ')' : ''}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookingId) { setError('Please select a booking.'); return; }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await submitFeedback({
        bookingId: parseInt(form.bookingId),
        rating: form.rating,
        comment: form.comment,
      });
      setSuccess('Thank you for your feedback!');
      setForm({ bookingId: '', rating: 5, comment: '' });
      // Refresh feedbacks
      const fbRes = await getAllFeedback();
      setMyFeedbacks((fbRes.data.data || []).filter((f) => f.userId === user?.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Share Your Experience</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Your feedback helps other travelers make better decisions.
        </Typography>

        <Grid container spacing={4}>
          {/* Feedback Form */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <RateReviewIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Write a Review</Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    select
                    label="Select Your Booking"
                    value={form.bookingId}
                    onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                    required
                    fullWidth
                    helperText="Only your confirmed/completed bookings are shown"
                  >
                    {bookings.length === 0 ? (
                      <MenuItem value="" disabled>No confirmed bookings found</MenuItem>
                    ) : (
                      bookings.map((b) => (
                        <MenuItem key={b.id} value={b.id}>
                          {getBookingDisplayName(b)}
                        </MenuItem>
                      ))
                    )}
                  </TextField>

                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Your Rating
                    </Typography>
                    <Rating
                      value={form.rating}
                      onChange={(_, val) => setForm({ ...form, rating: val })}
                      size="large"
                    />
                  </Box>

                  <TextField
                    label="Your Review"
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    multiline
                    rows={4}
                    required
                    fullWidth
                    placeholder="Share your experience about this package..."
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting || bookings.length === 0}
                    sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, py: 1.5 }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* My Reviews */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              My Reviews ({myFeedbacks.length})
            </Typography>
            {myFeedbacks.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>💬</Typography>
                  <Typography color="text.secondary">You haven't written any reviews yet.</Typography>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {myFeedbacks.map((fb) => (
                  <Card key={fb.id}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{fb.packageName}</Typography>
                          {fb.bookingName && (
                            <Typography variant="caption" color="text.secondary">{fb.bookingName}</Typography>
                          )}
                        </Box>
                        <Rating value={fb.rating} readOnly size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{fb.comment}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FeedbackPage;
