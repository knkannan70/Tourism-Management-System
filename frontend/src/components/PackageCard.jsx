import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip, Button, CardActions, IconButton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router-dom';

const PackageCard = ({ pkg, isWishlisted, onToggleWishlist }) => {
  const navigate = useNavigate();
  const imageUrl = pkg.imageUrl ? pkg.imageUrl : `https://picsum.photos/seed/${pkg.id}/400/250`;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&:hover .card-img': { transform: 'scale(1.08)' },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          className="card-img"
          component="img"
          height="220"
          image={imageUrl}
          alt={pkg.packageName}
          sx={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${pkg.id + 10}/400/250`; }}
        />
        <Box sx={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '50%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none'
        }} />
        {onToggleWishlist && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(pkg.id);
              }}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'background.paper',
                color: isWishlisted ? 'error.main' : 'text.secondary',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': { bgcolor: 'background.default', color: isWishlisted ? 'error.dark' : 'text.primary' },
              }}
            >
            {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        )}
      </Box>

      <CardContent sx={{ flex: 1, p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.3 }}>
          {pkg.packageName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <LocationOnIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {pkg.place?.placeName}, {pkg.place?.region}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
          <AccessTimeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{pkg.duration}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip label={pkg.place?.categoryName || 'Tourist Spot'} size="small" color="success" variant="outlined" />
          {pkg.place?.rating && (
            <Chip label={`⭐ ${pkg.place.rating}`} size="small" variant="outlined" />
          )}
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {pkg.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>Starting from</Typography>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800, lineHeight: 1 }}>
            ₹{pkg.price?.toLocaleString('en-IN')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="medium"
          color="primary"
          onClick={() => navigate(`/packages/${pkg.id}`)}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default PackageCard;
