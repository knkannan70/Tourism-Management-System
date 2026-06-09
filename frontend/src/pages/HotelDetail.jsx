import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  Button, CircularProgress, Chip, Divider, Avatar, Rating
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HotelIcon from '@mui/icons-material/Hotel';
import { getHotelById } from '../api/packageApi';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await getHotelById(id);
        setHotel(res.data.data);
      } catch (err) {
        setError('Failed to load hotel details.');
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error || !hotel) {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error || 'Hotel not found'}</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/hotels')} sx={{ mt: 2 }}>
          Back to Hotels
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
        backgroundImage: `url(${hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80'})`,
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
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/hotels')}
            sx={{ color: 'white', mb: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Rating value={hotel.starRating || 0} readOnly size="small" sx={{ color: '#fcd34d' }} />
            {hotel.stateName && <Chip label={hotel.stateName} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
          </Box>
          <Typography variant="h2" sx={{ color: 'white', fontWeight: 800, mb: 1, fontSize: { xs: '2.5rem', md: '4rem' } }}>
            {hotel.hotelName}
          </Typography>
          <Typography variant="h6" sx={{ color: '#e2e8f0', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon /> {hotel.address ? `${hotel.address}, ` : ''}{hotel.city}
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
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                        <HotelIcon fontSize="small" /> <Typography variant="body2">Price per Night</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.25rem', color: 'primary.main' }}>
                        ₹{hotel.pricePerNight}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                        <PhoneIcon fontSize="small" /> <Typography variant="body2">Contact</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>{hotel.contactNumber || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                        <StarIcon fontSize="small" sx={{ color: '#f59e0b' }} /> <Typography variant="body2">Guest Rating</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>{hotel.rating?.toFixed(1) || '0.0'} ({hotel.reviewCount || 0} reviews)</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Description */}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>About {hotel.hotelName}</Typography>
            <Typography sx={{ color: '#475569', mb: 4, lineHeight: 1.8 }}>
              {hotel.description || 'No description available for this hotel.'}
            </Typography>

            {/* Gallery */}
            {hotel.galleryUrls && hotel.galleryUrls.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>Gallery</Typography>
                <Grid container spacing={2}>
                  {hotel.galleryUrls.map((url, index) => (
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
            {hotel.videoUrl && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>Hotel Tour</Typography>
                <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 3, overflow: 'hidden' }}>
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    src={hotel.videoUrl?.replace?.('watch?v=', 'embed/')?.replace?.('youtu.be/', 'youtube.com/embed/')}
                    title="Hotel Video"
                    allowFullScreen
                  />
                </Box>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Amenities & Rooms */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Amenities</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(hotel.amenities ? hotel.amenities?.split?.(',') : ['Free WiFi', 'Room Service'])?.map?.((amenity, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>{amenity.trim()}</Typography>
                    </Box>
                  ))}
                </Box>

                {hotel.roomTypes && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Room Types</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {hotel.roomTypes?.split?.(',')?.map?.((room, idx) => (
                        <Box key={idx} sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a' }}>{room.trim()}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Map */}
            {hotel.googleMapsUrl && (
              <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <Box sx={{ p: 2, bgcolor: '#1e293b', color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Location Map</Typography>
                </Box>
                <Box sx={{ height: 300 }}>
                  <iframe
                    src={hotel.googleMapsUrl}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                  />
                </Box>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HotelDetail;
