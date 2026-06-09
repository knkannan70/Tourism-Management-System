import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Grid, TextField, MenuItem,
  InputAdornment, Slider, Button, Pagination, Chip, Rating,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getPackages, getPlaces, getCategories, getStates, getDistrictsByState } from '../api/packageApi';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlistApi';
import PackageCard from '../components/PackageCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const Packages = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [entryFeeMax, setEntryFeeMax] = useState(2000);
  const [selectedBestTime, setSelectedBestTime] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('name_asc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  useEffect(() => {
    const promises = [
      getPackages(),
      getPlaces(),
      getCategories(),
      getStates()
    ];
    if (user && user.role === 'USER') {
      promises.push(getWishlist());
    }

    Promise.all(promises)
      .then(([pkgRes, placeRes, catRes, stateRes, wishRes]) => {
        setPackages(pkgRes.data.data || []);
        setPlaces(placeRes.data.data || []);
        setCategories(catRes.data.data || []);
        setStates(stateRes.data.data || []);
        if (wishRes) {
          setWishlistIds(new Set((wishRes.data.data || []).map(p => p.id)));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Load districts dynamically when state changes
  useEffect(() => {
    if (selectedState) {
      getDistrictsByState(selectedState)
        .then((res) => {
          setDistricts(res.data.data || []);
        })
        .catch(console.error);
    } else {
      setDistricts([]);
    }
    setSelectedDistrict('');
  }, [selectedState]);

  const handleToggleWishlist = async (pkgId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const isWishlisted = wishlistIds.has(pkgId);
    try {
      if (isWishlisted) {
        await removeFromWishlist(pkgId);
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(pkgId);
          return next;
        });
      } else {
        await addToWishlist(pkgId);
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.add(pkgId);
          return next;
        });
      }
    } catch (e) {
      console.error("Wishlist error", e);
    }
  };

  const filtered = packages.filter((p) => {
    const matchSearch = p.packageName?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.place?.placeName?.toLowerCase().includes(search.toLowerCase());

    const matchState = selectedState ? p.place?.stateId === parseInt(selectedState) : true;
    const matchDistrict = selectedDistrict ? p.place?.districtId === parseInt(selectedDistrict) : true;
    const matchCategory = selectedCategory ? p.place?.categoryId === parseInt(selectedCategory) : true;
    const matchRating = selectedRating ? (p.place?.rating || 0) >= parseFloat(selectedRating) : true;
    const matchEntryFee = entryFeeMax !== '' ? (p.place?.entryFee || 0) <= parseFloat(entryFeeMax) : true;
    const matchBestTime = selectedBestTime ? p.place?.bestTime?.toLowerCase().includes(selectedBestTime.toLowerCase()) : true;
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];

    return matchSearch && matchState && matchDistrict && matchCategory && matchRating && matchEntryFee && matchBestTime && matchPrice;
  });

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'name_asc': return (a.packageName || '').localeCompare(b.packageName || '');
      case 'name_desc': return (b.packageName || '').localeCompare(a.packageName || '');
      case 'rating_desc': return (b.place?.rating || 0) - (a.place?.rating || 0);
      case 'rating_asc': return (a.place?.rating || 0) - (b.place?.rating || 0);
      case 'price_asc': return (a.price || 0) - (b.price || 0);
      case 'price_desc': return (b.price || 0) - (a.price || 0);
      default: return 0;
    }
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const handleClear = () => {
    setSearch('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedCategory('');
    setSelectedRating('');
    setEntryFeeMax(2000);
    setSelectedBestTime('');
    setPriceRange([0, 100000]);
    setSortBy('name_asc');
    setPage(1);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08), #ffffff)', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 800, mb: 1, fontFamily: '"Outfit", sans-serif' }}>
            Tour Packages
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            {filtered.length} packages available for your next adventure
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Filters */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            p: 3,
            mb: 4,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="Search packages or places..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="State"
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setPage(1); }}
                size="small"
              >
                <MenuItem value="">All States</MenuItem>
                {states.map((st) => (
                  <MenuItem key={st.id} value={st.id}>{st.stateName}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="District"
                value={selectedDistrict}
                onChange={(e) => { setSelectedDistrict(e.target.value); setPage(1); }}
                size="small"
                disabled={!selectedState}
              >
                <MenuItem value="">All Districts</MenuItem>
                {districts.map((dst) => (
                  <MenuItem key={dst.id} value={dst.id}>{dst.districtName}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Category"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                size="small"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.categoryName}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Min Rating"
                value={selectedRating}
                onChange={(e) => { setSelectedRating(e.target.value); setPage(1); }}
                size="small"
              >
                <MenuItem value="">All Ratings</MenuItem>
                <MenuItem value="4.5">⭐ 4.5 & Above</MenuItem>
                <MenuItem value="4.0">⭐ 4.0 & Above</MenuItem>
                <MenuItem value="3.0">⭐ 3.0 & Above</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                placeholder="Best Season (e.g. Winter)"
                label="Best Time to Visit"
                value={selectedBestTime}
                onChange={(e) => { setSelectedBestTime(e.target.value); setPage(1); }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Sort By"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                size="small"
              >
                <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                <MenuItem value="rating_desc">Highest Rating</MenuItem>
                <MenuItem value="rating_asc">Lowest Rating</MenuItem>
                <MenuItem value="price_asc">Price (Low-High)</MenuItem>
                <MenuItem value="price_desc">Price (High-Low)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleClear}
                sx={{ color: 'primary.main', borderColor: 'primary.main', height: '40px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Price Budget: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, val) => { setPriceRange(val); setPage(1); }}
                min={0}
                max={100000}
                step={2000}
                valueLabelDisplay="auto"
                sx={{ color: 'primary.main' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Max Entry Fee: ₹{entryFeeMax.toLocaleString()}
              </Typography>
              <Slider
                value={entryFeeMax}
                onChange={(_, val) => { setEntryFeeMax(val); setPage(1); }}
                min={0}
                max={5000}
                step={50}
                valueLabelDisplay="auto"
                sx={{ color: 'primary.main' }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Active Filter Chips */}
        {(search || selectedState || selectedCategory || selectedRating || selectedBestTime) && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {search && <Chip label={`Search: "${search}"`} onDelete={() => setSearch('')} size="small" />}
            {selectedState && (
              <Chip
                label={`State: ${states.find((s) => s.id === parseInt(selectedState))?.stateName}`}
                onDelete={() => setSelectedState('')}
                size="small"
              />
            )}
            {selectedDistrict && (
              <Chip
                label={`District: ${districts.find((d) => d.id === parseInt(selectedDistrict))?.districtName}`}
                onDelete={() => setSelectedDistrict('')}
                size="small"
              />
            )}
            {selectedCategory && (
              <Chip
                label={`Category: ${categories.find((c) => c.id === parseInt(selectedCategory))?.categoryName}`}
                onDelete={() => setSelectedCategory('')}
                size="small"
              />
            )}
            {selectedRating && <Chip label={`Rating: ${selectedRating}+`} onDelete={() => setSelectedRating('')} size="small" />}
            {selectedBestTime && <Chip label={`Best Time: ${selectedBestTime}`} onDelete={() => setSelectedBestTime('')} size="small" />}
          </Box>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : paginated.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h5" color="text.secondary">No packages found</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Try adjusting your search criteria or clearing filters</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginated.map((pkg) => (
                <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                  <PackageCard 
                    pkg={pkg} 
                    isWishlisted={wishlistIds.has(pkg.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, val) => setPage(val)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Packages;
