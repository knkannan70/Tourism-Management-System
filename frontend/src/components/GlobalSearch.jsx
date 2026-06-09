import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Autocomplete,
  TextField,
  InputAdornment,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import HotelIcon from '@mui/icons-material/Hotel';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import { searchPlaces } from '../api/placeApi';
import { searchHotels } from '../api/hotelApi';
import { getPackages } from '../api/packageApi';

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    if (query.trim() === '') {
      setOptions([]);
      return undefined;
    }

    setLoading(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const [placesRes, hotelsRes, packagesRes] = await Promise.all([
          searchPlaces(query).catch(() => ({ data: { data: [] } })),
          searchHotels(query).catch(() => ({ data: { data: [] } })),
          getPackages({ search: query }).catch(() => ({ data: { data: [] } })),
        ]);

        if (active) {
          const places = (placesRes.data?.data || []).map(p => ({
            ...p,
            type: 'Places',
            label: p.placeName,
            icon: <PlaceIcon fontSize="small" sx={{ color: 'primary.main' }} />,
            url: `/places/${p.id}`
          }));

          const hotels = (hotelsRes.data?.data || []).map(h => ({
            ...h,
            type: 'Hotels',
            label: h.hotelName,
            icon: <HotelIcon fontSize="small" sx={{ color: 'primary.main' }} />,
            url: `/hotels/${h.id}`
          }));

          const packages = (packagesRes.data?.data || []).map(p => ({
            ...p,
            type: 'Packages',
            label: p.packageName,
            icon: <CardTravelIcon fontSize="small" sx={{ color: 'primary.main' }} />,
            url: `/packages/${p.id}`
          }));

          setOptions([...places, ...hotels, ...packages]);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        if (active) setLoading(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [query]);

  return (
    <Autocomplete
      id="global-search"
      sx={{
        width: { xs: '100%', md: 280, lg: 340 },
        '& .MuiOutlinedInput-root': {
          bgcolor: '#ffffff',
          color: 'text.primary',
          borderRadius: 50, // Pill shape to match the theme
          py: 0.25,
          pl: 1.5,
          transition: 'all 0.2s',
          '& fieldset': { border: 'none' },
          '&:hover': { bgcolor: '#f8fafc', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
          '&.Mui-focused': {
            bgcolor: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '& .MuiSvgIcon-root': { color: 'text.secondary' }
          }
        },
        '& .MuiAutocomplete-input': {
          '&::placeholder': {
            color: 'text.secondary',
            opacity: 0.8,
            fontWeight: 500
          }
        },
        '& .MuiAutocomplete-clearIndicator, & .MuiAutocomplete-popupIndicator': {
          color: 'text.secondary'
        }
      }}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) => option.id === value.id && option.type === value.type}
      getOptionLabel={(option) => option.label || ''}
      options={options}
      groupBy={(option) => option.type}
      loading={loading}
      inputValue={query}
      onInputChange={(event, newInputValue) => {
        setQuery(newInputValue);
      }}
      onChange={(event, newValue) => {
        if (newValue && newValue.url) {
          navigate(newValue.url);
          setQuery('');
          setOptions([]);
          document.activeElement?.blur();
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search anywhere..."
          size="small"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress sx={{ color: 'primary.main' }} size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={`${option.type}-${option.id}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 1, bgcolor: 'rgba(193, 18, 31, 0.1)' }}>
              {option.icon}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.label}</Typography>
          </Box>
        </li>
      )}
    />
  );
};

export default GlobalSearch;
