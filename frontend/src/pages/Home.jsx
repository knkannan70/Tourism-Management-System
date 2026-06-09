import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Button, Grid, Card,
  Avatar, Rating, Chip, Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/Explore';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { getPackages } from '../api/packageApi';
import { getAllFeedback } from '../api/feedbackApi';
import PackageCard from '../components/PackageCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPackages(), getAllFeedback()])
      .then(([pkgRes, fbRes]) => {
        setPackages(pkgRes.data.data?.slice(0, 6) || []);
        setFeedbacks(fbRes.data.data?.slice(0, 3) || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const features = [
    { icon: <ExploreIcon sx={{ fontSize: 40 }} />, title: 'Explore Destinations', desc: 'Discover breathtaking places across India and beyond.' },
    { icon: <SecurityIcon sx={{ fontSize: 40 }} />, title: 'Safe & Secure', desc: 'Your bookings are protected with industry-grade security.' },
    { icon: <PriceCheckIcon sx={{ fontSize: 40 }} />, title: 'Best Prices', desc: 'We offer competitive pricing with no hidden charges.' },
    { icon: <SupportAgentIcon sx={{ fontSize: 40 }} />, title: '24/7 Support', desc: 'Our team is always ready to assist you anytime.' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(193, 18, 31, 0.08) 0%, #ffffff 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c1121f' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="✨ Explore The World With Us"
                sx={{
                  bgcolor: 'rgba(193, 18, 31, 0.08)',
                  color: 'primary.main',
                  mb: 3,
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: 'rgba(193, 18, 31, 0.2)'
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  lineHeight: 1.1,
                  mb: 2
                }}
              >
                Discover Your Next
                <Box component="span" sx={{ color: 'primary.main', display: 'block' }}>
                  Dream Destination
                </Box>
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '1.2rem', mb: 5, maxWidth: 500 }}>
                Curated travel packages, handpicked hotels, and unforgettable experiences — crafted perfectly for you.
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/packages')}
                  sx={{ px: 4, py: 1.5, fontSize: '1.1rem', boxShadow: '0 8px 24px rgba(193, 18, 31, 0.3)' }}
                >
                  Explore Packages
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    px: 4, py: 1.5, fontSize: '1.1rem',
                    color: 'text.primary',
                    borderColor: 'divider',
                    bgcolor: '#ffffff',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(225, 29, 72, 0.05)' }
                  }}
                >
                  Get Started Free
                </Button>
              </Stack>
              <Box sx={{ mt: 6, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {[
                  { value: '500+', label: 'Happy Travelers' },
                  { value: '50+', label: 'Destinations' },
                  { value: '100+', label: 'Packages' },
                ].map((s) => (
                  <Box key={s.label}>
                    <Typography
                      sx={{ color: 'primary.main', fontWeight: 800, fontSize: '2rem', fontFamily: '"Outfit", sans-serif' }}
                    >
                      {s.value}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 600 }}>{s.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 350,
                    height: 350,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(225, 29, 72, 0.05))',
                    animation: 'pulse 3s infinite alternate',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(0.95)', opacity: 0.8 },
                      '100%': { transform: 'scale(1.05)', opacity: 1 },
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 50px rgba(225, 29, 72, 0.15)'
                  }}
                >
                  <FlightTakeoffIcon sx={{ fontSize: 150, color: 'primary.main', transform: 'rotate(15deg)' }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
            Why Choose TourVista?
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
            We provide the best travel experience with premium services, ensuring your journey is unforgettable from start to finish.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Card
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: 4,
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(225, 29, 72, 0.12)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 3,
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'rgba(225, 29, 72, 0.08)'
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 800, color: 'text.primary' }}>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontWeight: 500 }}>{f.desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Packages */}
      <Box sx={{ py: 10, bgcolor: '#ffffff', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
              Featured Packages
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>Handpicked tours for every traveler</Typography>
          </Box>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Grid container spacing={4}>
              {packages.map((pkg) => (
                <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                  <PackageCard pkg={pkg} />
                </Grid>
              ))}
            </Grid>
          )}
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={() => navigate('/packages')}
              sx={{ px: 5, py: 1.5, fontSize: '1.1rem', boxShadow: '0 8px 24px rgba(225, 29, 72, 0.3)' }}
            >
              View All Packages
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Testimonials */}
      {feedbacks.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
              What Our Travelers Say
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>Real stories from real explorers</Typography>
          </Box>
          <Grid container spacing={4}>
            {feedbacks.map((fb) => (
              <Grid item xs={12} md={4} key={fb.id}>
                <Card
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 12px 30px rgba(225, 29, 72, 0.08)'
                    }
                  }}
                >
                  <Rating value={fb.rating} readOnly size="small" sx={{ mb: 3 }} />
                  <Typography variant="body1" sx={{ mb: 4, fontStyle: 'italic', color: 'text.primary', lineHeight: 1.7 }}>
                    "{fb.comment}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', color: '#ffffff', width: 48, height: 48, fontWeight: 700 }}>
                      {fb.userFullName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>{fb.userFullName}</Typography>
                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>Verified Traveler</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.dark', color: '#ffffff', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={5}>
            <Grid item xs={12} md={4}>
              <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 2, color: '#ffffff' }}>
                Tour<span style={{ color: '#fb7185' }}>Vista</span>
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.7 }}>
                Your trusted partner for unforgettable travel experiences across India and beyond. Explore the world with confidence.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#ffffff' }}>Quick Links</Typography>
              <Stack spacing={1.5}>
                {['Home', 'Packages', 'Login', 'Register'].map((l) => (
                  <Typography
                    key={l}
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      display: 'inline-block',
                      width: 'fit-content',
                      fontWeight: 500,
                      '&:hover': { color: '#ffffff', transform: 'translateX(4px)' },
                      transition: 'all 0.2s',
                    }}
                    onClick={() => navigate(l === 'Home' ? '/' : `/${l.toLowerCase()}`)}
                  >
                    {l}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#ffffff' }}>Contact Us</Typography>
              <Stack spacing={2}>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500 }}>
                  <span>📧</span> info@tourvista.com
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500 }}>
                  <span>📞</span> 044-24301930
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500 }}>
                  <span>📍</span> Tamilnadu, India
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.15)', mt: 8, pt: 4, textAlign: 'center' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 500 }}>
              © 2024 TourVista. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
