import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Button, Chip, Divider,
  Card, CardContent, Avatar, Rating, Alert, CircularProgress,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HotelIcon from '@mui/icons-material/Hotel';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getPackageById } from '../api/packageApi';
import { getAllFeedback } from '../api/feedbackApi';
import { useAuth } from '../context/AuthContext';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getPackageById(id), getAllFeedback()])
      .then(([pkgRes, fbRes]) => {
        setPkg(pkgRes.data.data);
        const allFb = fbRes.data.data || [];
        setFeedbacks(allFb.filter((f) => f.packageId === parseInt(id)));
      })
      .catch(() => setError('Package not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error || !pkg) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">{error || 'Package not found.'}</Alert>
        <Button onClick={() => navigate('/packages')} sx={{ mt: 2 }}>Back to Packages</Button>
      </Container>
    );
  }

  const imageUrl = pkg.imageUrl || `https://picsum.photos/seed/${pkg.id}/1200/500`;
  const avgRating = feedbacks.length
    ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length
    : 0;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Image */}
      <Box
        sx={{
          height: { xs: 250, md: 450 },
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
            display: 'flex',
            alignItems: 'flex-end',
            p: 4,
          }}
        >
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/packages')}
              sx={{ color: 'white', mb: 2, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
            >
              Back to Packages
            </Button>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
              {pkg.packageName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={pkg.place?.placeName} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              <Chip label={pkg.duration} sx={{ bgcolor: 'rgba(245,158,11,0.8)', color: '#000', fontWeight: 600 }} />
              {feedbacks.length > 0 && (
                <Chip
                  label={`⭐ ${avgRating.toFixed(1)} (${feedbacks.length} reviews)`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>About This Package</Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                  {pkg.description}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Package Highlights</Typography>
                <Grid container spacing={2}>
                  {[
                    { icon: <LocationOnIcon />, label: 'Destination', value: `${pkg.place?.placeName}, ${pkg.place?.region}` },
                    { icon: <AccessTimeIcon />, label: 'Duration', value: pkg.duration },
                    { icon: <HotelIcon />, label: 'Hotel', value: pkg.hotel?.hotelName },
                    { icon: <WbSunnyIcon />, label: 'Best Season', value: pkg.place?.season || 'All Year' },
                  ].map((item) => (
                    <Grid item xs={12} sm={6} key={item.label}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                        <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Hotel Info */}
            {pkg.hotel && (
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Hotel Information</Typography>
                  <Box
                    component="img"
                    src={pkg.hotel.imageUrl || `https://picsum.photos/seed/hotel${pkg.hotel.id}/600/200`}
                    alt={pkg.hotel.hotelName}
                    sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 2, mb: 2 }}
                    onError={(e) => { e.target.src = `https://picsum.photos/seed/hotel${pkg.hotel.id}/600/200`; }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{pkg.hotel.hotelName}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>{pkg.hotel.description}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Location:</strong> {pkg.hotel.location}
                  </Typography>
                  {pkg.hotel.rating && (
                    <Rating value={pkg.hotel.rating} readOnly precision={0.5} sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {feedbacks.length > 0 && (
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Customer Reviews ({feedbacks.length})
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {avgRating.toFixed(1)}
                    </Typography>
                    <Box>
                      <Rating value={avgRating} readOnly precision={0.1} />
                      <Typography variant="caption" color="text.secondary">
                        Based on {feedbacks.length} reviews
                      </Typography>
                    </Box>
                  </Box>
                  {feedbacks.map((fb) => (
                    <Box key={fb.id} sx={{ mb: 3, pb: 3, borderBottom: '1px solid #e2e8f0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.9rem' }}>
                          {fb.userFullName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{fb.userFullName}</Typography>
                          <Rating value={fb.rating} readOnly size="small" />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">{fb.comment}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Booking Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 80 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 0.5 }}>
                  ₹{pkg.price?.toLocaleString('en-IN')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>per person</Typography>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                  {[
                    { label: 'Duration', value: pkg.duration },
                    { label: 'Destination', value: pkg.place?.placeName },
                    { label: 'Hotel', value: pkg.hotel?.hotelName },
                    { label: 'Season', value: pkg.place?.season || 'All Year' },
                  ].map((row) => (
                    <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.value}</Typography>
                    </Box>
                  ))}
                </Box>

                {user?.role === 'USER' ? (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => navigate(`/booking/${pkg.id}`)}
                    sx={{
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' },
                      py: 1.5,
                      fontSize: '1rem',
                    }}
                  >
                    Book Now
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, py: 1.5 }}
                  >
                    Login to Book
                  </Button>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                  Free cancellation within 24 hours
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PackageDetail;
