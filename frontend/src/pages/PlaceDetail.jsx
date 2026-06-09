import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  Button, CircularProgress, Chip, Divider, Avatar, Rating
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaidIcon from '@mui/icons-material/Paid';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getPlaceById } from '../api/packageApi';

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const res = await getPlaceById(id);
        setPlace(res.data.data);
      } catch (err) {
        setError('Failed to load place details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error || !place) {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error || 'Place not found'}</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/places')} sx={{ mt: 2 }}>
          Back to Places
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8 }}>
      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        height: { xs: 300, md: 500 },
        backgroundImage: `url(${place.imageUrl || 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
        }
      }}>
        <Container sx={{ position: 'relative', zIndex: 1, pb: 6 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/places')}
            sx={{ color: 'white', mb: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {place.categoryName && <Chip label={place.categoryName} sx={{ bgcolor: 'primary.main', color: 'white' }} />}
            {place.stateName && <Chip label={place.stateName} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
          </Box>
          <Typography variant="h2" sx={{ color: 'white', fontWeight: 800, mb: 1, fontSize: { xs: '2.5rem', md: '4rem' } }}>
            {place.placeName}
          </Typography>
          <Typography variant="h6" sx={{ color: '#e2e8f0', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon /> {place.districtName ? `${place.districtName}, ` : ''}{place.region}
          </Typography>
        </Container>
      </Box>

      <Container sx={{ mt: -4, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Quick Info Card */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                        <AccessTimeIcon fontSize="small" /> <Typography variant="body2">Timings</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>{place.openingTime} - {place.closingTime}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                        <PaidIcon fontSize="small" /> <Typography variant="body2">Entry Fee</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>{place.entryFee > 0 ? `₹${place.entryFee}` : 'Free Entry'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                        <CalendarMonthIcon fontSize="small" /> <Typography variant="body2">Best Time</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>{place.bestTime || place.season || 'Year Round'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                        <StarIcon fontSize="small" sx={{ color: '#f59e0b' }} /> <Typography variant="body2">Rating</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>{place.rating?.toFixed(1) || '0.0'} ({place.reviewCount || 0} reviews)</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Description */}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>About {place.placeName}</Typography>
            <Typography sx={{ color: '#475569', mb: 4, lineHeight: 1.8 }}>
              {place.description || 'No description available for this place.'}
            </Typography>

            {/* Gallery */}
            {place.galleryUrls && place.galleryUrls.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>Gallery</Typography>
                <Grid container spacing={2}>
                  {place.galleryUrls.map((url, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <Box sx={{
                        width: '100%', height: 200, borderRadius: 2,
                        backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center',
                        transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.02)' }
                      }} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Video */}
            {place.videoUrl && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>Experience Video</Typography>
                <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 3, overflow: 'hidden' }}>
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    src={place.videoUrl?.replace?.('watch?v=', 'embed/')?.replace?.('youtu.be/', 'youtube.com/embed/')}
                    title="Place Video"
                    allowFullScreen
                  />
                </Box>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Map */}
            {place.googleMapsUrl && (
              <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <Box sx={{ p: 2, bgcolor: '#1e293b', color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Location Map</Typography>
                </Box>
                <Box sx={{ height: 300 }}>
                  <iframe
                    src={place.googleMapsUrl}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                  />
                </Box>
              </Card>
            )}

            {/* Additional Info */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Good to Know</Typography>
                
                {place.popularActivities && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Popular Activities</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {place.popularActivities?.split?.(',')?.map((act, i) => (
                        <Chip key={i} label={act.trim()} size="small" sx={{ bgcolor: '#e2e8f0' }} />
                      ))}
                    </Box>
                  </Box>
                )}

                {place.travelTips && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Travel Tips</Typography>
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>{place.travelTips}</Typography>
                  </Box>
                )}

                {place.nearbyAttractions && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Nearby Attractions</Typography>
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>{place.nearbyAttractions}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PlaceDetail;
