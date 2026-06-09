import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Grid,
  Chip, Button, Alert, Divider,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import { getMyBookings, cancelBooking, userDeleteBooking } from '../api/bookingApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'error',
  COMPLETED: 'info',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await cancelBooking(id);
        const res = await getMyBookings();
        setBookings(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel booking.');
      }
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm("Are you sure you want to remove this booking from your view? (It will still remain saved in admin records)")) {
      try {
        await userDeleteBooking(id);
        setBookings(bookings.filter(b => b.id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete booking.');
      }
    }
  };

  const handleDownloadReceipt = (booking) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Receipt - #${booking.id}</title>
          <style>
            body { font-family: 'Outfit', 'Inter', sans-serif; color: #0f172a; margin: 40px; }
            .receipt-container { max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e11d48; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 800; color: #e11d48; }
            .logo span { color: #e11d48; }
            .title { font-size: 18px; font-weight: 700; text-transform: uppercase; color: #64748b; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: 700; color: #e11d48; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .label { color: #64748b; font-size: 14px; }
            .value { font-weight: 600; font-size: 14px; }
            .total-box { background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
            .total-amount { font-size: 20px; font-weight: 800; color: #e11d48; }
            .badge { background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; }
            @media print {
              body { margin: 0; }
              .receipt-container { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="logo">Tour<span>Vista</span></div>
              <div class="title">Booking Receipt</div>
            </div>
            
            <div class="section">
              <div class="section-title">Receipt Information</div>
              <div class="row">
                <span class="label">Booking ID</span>
                <span class="value">#${booking.id}</span>
              </div>
              <div class="row">
                <span class="label">Booking Date</span>
                <span class="value">${new Date(booking.bookingDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div class="row">
                <span class="label">Status</span>
                <span class="value"><span class="badge">${booking.status || 'CONFIRMED'}</span></span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Customer Details</div>
              <div class="row">
                <span class="label">Name</span>
                <span class="value">${booking.userFullName || 'Valued Customer'}</span>
              </div>
              <div class="row">
                <span class="label">Email</span>
                <span class="value">${booking.userEmail || ''}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Package Details</div>
              <div class="row">
                <span class="label">Package Name</span>
                <span class="value">${booking.packageName || ''}</span>
              </div>
              <div class="row">
                <span class="label">Destination</span>
                <span class="value">${booking.placeName || ''}</span>
              </div>
              <div class="row">
                <span class="label">Travel Date</span>
                <span class="value">${new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div class="row">
                <span class="label">Persons</span>
                <span class="value">${booking.numberOfPersons || 1} person(s)</span>
              </div>
              ${booking.specialRequests ? `
              <div class="row">
                <span class="label">Special Requests</span>
                <span class="value">${booking.specialRequests}</span>
              </div>` : ''}
            </div>

            <div class="total-box">
              <div>
                <span class="label" style="display:block;">Total Paid Amount</span>
                <span class="total-amount">₹${booking.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
              <span class="badge" style="font-size:14px; padding:6px 12px;">Paid</span>
            </div>

            <div class="section" style="margin-top: 25px; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
              <div style="flex: 1;">
                <div class="section-title" style="border: none; margin-bottom: 4px;">Terms & Conditions</div>
                <ul style="font-size: 11px; color: #64748b; padding-left: 15px; margin: 0; line-height: 1.5;">
                  <li>Carry this printed ticket and a valid ID proof during travel.</li>
                  <li>Cancellations are subject to standard package policies.</li>
                  <li>Reach out to support@tourvista.com for assistance.</li>
                </ul>
              </div>
              <div style="text-align: center; margin-left: 20px;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=TourVista-Booking-${booking.id}" alt="QR Verification" style="width: 80px; height: 80px;" />
                <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">Scan to Verify</div>
              </div>
            </div>

            <div class="footer">
              Thank you for booking with TourVista! Have a wonderful journey.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    getMyBookings()
      .then((res) => setBookings(res.data.data || []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>My Bookings</Typography>
            <Typography color="text.secondary">{bookings.length} booking(s) found</Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/packages')}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Book New Package
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {bookings.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h1" sx={{ mb: 2 }}>✈️</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>No Bookings Yet</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Start exploring our packages and book your dream vacation!
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/packages')}
                sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                Explore Packages
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {bookings.map((booking) => (
              <Grid item xs={12} key={booking.id}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Box
                          component="img"
                          src={booking.packageImageUrl || `https://picsum.photos/seed/${booking.packageId}/300/150`}
                          alt={booking.packageName}
                          sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          onError={(e) => { e.target.src = `https://picsum.photos/seed/${booking.packageId}/300/150`; }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {booking.packageName}
                          </Typography>
                          <Chip
                            label={booking.status}
                            color={statusColors[booking.status] || 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          📍 {booking.placeName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(booking.travelDate).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric',
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PeopleIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary">
                              {booking.numberOfPersons} person(s)
                            </Typography>
                          </Box>
                        </Box>
                        {booking.specialRequests && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Note: {booking.specialRequests}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={3} sx={{ textAlign: { sm: 'right' } }}>
                        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 800 }}>
                          ₹{booking.totalAmount?.toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Booking #{booking.id}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Booked on {new Date(booking.bookingDate).toLocaleDateString('en-IN')}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { sm: 'flex-end' } }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleDownloadReceipt(booking)}
                            sx={{ color: 'primary.main', borderColor: 'primary.main', '&:hover': { borderColor: 'primary.dark', bgcolor: 'rgba(225,29,72,0.04)' } }}
                          >
                            Download PDF
                          </Button>
                          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ color: 'text.secondary', borderColor: 'text.secondary', '&:hover': { borderColor: 'text.primary', color: 'text.primary', bgcolor: 'rgba(0,0,0,0.04)' } }}
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MyBookings;
