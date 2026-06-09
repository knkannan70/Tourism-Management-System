import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Avatar, Chip,
  List, ListItem, ListItemText, ListItemAvatar, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getDashboardStats } from '../../api/adminApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import PlaceIcon from '@mui/icons-material/Place';
import HotelIcon from '@mui/icons-material/Hotel';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StarIcon from '@mui/icons-material/Star';
import FeedbackIcon from '@mui/icons-material/Feedback';

const COLORS = ['#c1121f', '#000000', '#f59e0b', '#3b82f6', '#10b981'];

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden', borderLeft: `4px solid ${color}` }}>
    <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.05, transform: 'scale(4)' }}>
      {React.cloneElement(icon)}
    </Box>
    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#000000', mb: 1 }}>{value}</Typography>
          {subtitle && <Typography variant="caption" sx={{ color: color, fontWeight: 600, bgcolor: `${color}15`, px: 1, py: 0.5, borderRadius: 1 }}>{subtitle}</Typography>}
        </Box>
        <Avatar sx={{ bgcolor: `${color}15`, width: 48, height: 48 }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 24 } })}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: <PeopleIcon />, color: '#c1121f', subtitle: 'Registered members' },
    { title: 'Total Packages', value: stats?.totalPackages || 0, icon: <CardTravelIcon />, color: '#000000', subtitle: 'Active packages' },
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: <BookOnlineIcon />, color: '#f59e0b', subtitle: 'All time' },
    { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: <AttachMoneyIcon />, color: '#10b981', subtitle: 'Total earnings' },
    { title: 'Total Places', value: stats?.totalPlaces || 0, icon: <PlaceIcon />, color: '#8b5cf6', subtitle: 'Tourist destinations' },
    { title: 'Total Hotels', value: stats?.totalHotels || 0, icon: <HotelIcon />, color: '#0ea5e9', subtitle: 'Listed properties' },
    { title: 'Total Feedback', value: stats?.totalFeedbacks || 0, icon: <FeedbackIcon />, color: '#f97316', subtitle: 'User feedback' },
    { title: 'Total Reviews', value: stats?.totalReviews || 0, icon: <RateReviewIcon />, color: '#ec4899', subtitle: 'Place & hotel reviews' },
    { title: 'Avg Rating', value: stats?.averageRating ? stats.averageRating.toFixed(1) + ' ★' : '—', icon: <StarIcon />, color: '#f59e0b', subtitle: 'Overall satisfaction' },
  ];

  // Build chart data from stats
  const bookingStatusData = [
    { name: 'Pending', value: stats?.pendingBookings || 0 },
    { name: 'Confirmed', value: stats?.confirmedBookings || 0 },
    { name: 'Cancelled', value: stats?.cancelledBookings || 0 },
    { name: 'Completed', value: stats?.completedBookings || 0 },
  ].filter((d) => d.value > 0);

  const monthlyData = stats?.monthlyBookings || [];
  const placeAnalytics = stats?.placeAnalytics || [];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>Dashboard Overview</Typography>
        <Typography color="text.secondary">Welcome back! Here's what's happening today.</Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.title}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Bookings Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 380 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TrendingUpIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Monthly Bookings</Typography>
              </Box>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#c1121f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                  <Typography color="text.secondary">No monthly data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Status Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 380 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Booking Status</Typography>
              {bookingStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={bookingStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {bookingStatusData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                  <Typography color="text.secondary">No bookings yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Place-wise Analytics Table */}
      {placeAnalytics.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PlaceIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Place-wise Analytics</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Place</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>District</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Hotels</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Packages</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {placeAnalytics.map((pa) => (
                    <TableRow key={pa.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{pa.placeName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{pa.districtName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{pa.stateName}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={pa.hotelCount} size="small" sx={{ bgcolor: '#0ea5e915', color: '#0ea5e9', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={pa.packageCount} size="small" sx={{ bgcolor: '#8b5cf615', color: '#8b5cf6', fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Bookings */}
      {stats?.recentBookings?.length > 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Bookings</Typography>
            <List disablePadding>
              {stats.recentBookings.map((b, i) => (
                <React.Fragment key={b.id}>
                  <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(193, 18, 31, 0.1)', color: 'primary.main', fontWeight: 700 }}>
                        {b.userName?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={b.packageName}
                      secondary={`${b.userName} • ${new Date(b.bookingDate).toLocaleDateString('en-IN')}`}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ₹{b.totalAmount?.toLocaleString('en-IN')}
                      </Typography>
                      <Chip
                        label={b.status}
                        size="small"
                        color={b.status === 'CONFIRMED' ? 'success' : b.status === 'PENDING' ? 'warning' : 'error'}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </ListItem>
                  {i < stats.recentBookings.length - 1 && <Box sx={{ borderBottom: '1px solid #f1f5f9' }} />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminDashboard;
