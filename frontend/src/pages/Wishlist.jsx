import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getWishlist, removeFromWishlist } from '../api/wishlistApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchWishlist = () => {
    setLoading(true);
    getWishlist()
      .then((res) => setItems(res.data.data || []))
      .catch(() => setError('Failed to load wishlist items.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (packageId) => {
    try {
      await removeFromWishlist(packageId);
      setItems(items.filter((item) => item.id !== packageId));
    } catch {
      setError('Failed to remove item.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>My Wishlist</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Manage your favorited packages and complete quick bookings.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {items.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h1" sx={{ mb: 2 }}>❤️</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Your Wishlist is Empty</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Explore packages and click the wishlist button to bookmark destinations you love.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/packages')}
                sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                Browse Packages
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {items.map((pkg) => (
              <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={pkg.imageUrl || `https://picsum.photos/seed/${pkg.id}/400/250`}
                    alt={pkg.packageName}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{pkg.packageName}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      📍 {pkg.place?.placeName} | ⏱ {pkg.duration}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800 }}>
                      ₹{pkg.price?.toLocaleString('en-IN')}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => navigate(`/booking/${pkg.id}`)}
                      sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                    >
                      Book Now
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemove(pkg.id)}
                      sx={{ minWidth: 48, px: 1 }}
                    >
                      <DeleteIcon />
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Wishlist;
