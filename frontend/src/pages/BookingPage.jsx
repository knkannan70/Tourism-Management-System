import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent, Grid, TextField,
  Button, Alert, Divider, CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PeopleIcon from '@mui/icons-material/People';
import dayjs from 'dayjs';
import { getPackageById } from '../api/packageApi';
import { createBooking } from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';

const BookingPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [form, setForm] = useState({
    travelDate: dayjs().add(7, 'day'),
    numberOfPersons: 1,
    specialRequests: '',
  });

  useEffect(() => {
    getPackageById(packageId)
      .then((res) => setPkg(res.data.data))
      .catch(() => setError('Package not found.'))
      .finally(() => setLoading(false));
  }, [packageId]);

  const totalPrice = pkg ? pkg.price * form.numberOfPersons : 0;

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
                <span class="value"><span class="badge">${booking.status || booking.bookingStatus || 'CONFIRMED'}</span></span>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await createBooking({
        packageId: parseInt(packageId),
        travelDate: form.travelDate.format('YYYY-MM-DD'),
        numberOfPersons: form.numberOfPersons,
        specialRequests: form.specialRequests,
        totalAmount: totalPrice,
      });
      setCreatedBooking(res.data.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (success && createdBooking) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 3, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h2" sx={{ mb: 1 }}>🎉</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>Booking Confirmed!</Typography>
                <Typography variant="body2" color="text.secondary">
                  Your package has been successfully booked. Here is your receipt.
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>
                  Booking Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Booking ID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>#{createdBooking.id}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Travel Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(createdBooking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Package Name</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{createdBooking.packageName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Destination</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{createdBooking.placeName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Persons</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{createdBooking.numberOfPersons || 1} person(s)</Typography>
                  </Grid>
                  {createdBooking.specialRequests && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Special Requests</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontStyle: 'italic' }}>{createdBooking.specialRequests}</Typography>
                    </Grid>
                  )}
                </Grid>
                
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Total Paid</Typography>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800 }}>
                      ₹{createdBooking.totalAmount?.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: 'rgba(225,29,72,0.1)', color: 'primary.main', px: 2, py: 0.5, borderRadius: 999, fontWeight: 700, fontSize: '0.75rem' }}>
                    PAID
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleDownloadReceipt(createdBooking)}
                  sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, py: 1.5 }}
                >
                  Download Receipt
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/my-bookings')}
                  sx={{ color: 'primary.main', borderColor: 'primary.main', '&:hover': { borderColor: 'primary.dark', bgcolor: 'rgba(225,29,72,0.04)' }, py: 1.5 }}
                >
                  My Bookings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Complete Your Booking</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>You're almost there! Fill in the details below.</Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Travel Details</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <DatePicker
                    label="Travel Date"
                    value={form.travelDate}
                    onChange={(val) => setForm({ ...form, travelDate: val })}
                    minDate={dayjs().add(1, 'day')}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                  <TextField
                    label="Number of Persons"
                    type="number"
                    value={form.numberOfPersons}
                    onChange={(e) => setForm({ ...form, numberOfPersons: Math.max(1, parseInt(e.target.value) || 1) })}
                    InputProps={{
                      inputProps: { min: 1, max: 20 },
                      startAdornment: <PeopleIcon sx={{ color: 'primary.main', mr: 1 }} />,
                    }}
                    required
                  />
                  <TextField
                    label="Special Requests (Optional)"
                    value={form.specialRequests}
                    onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Any special requirements, dietary needs, etc."
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, py: 1.5, fontSize: '1rem' }}
                  >
                    {submitting ? 'Processing...' : `Confirm Booking — ₹${totalPrice.toLocaleString('en-IN')}`}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            {pkg && (
              <Card>
                <Box
                  component="img"
                  src={pkg.imageUrl || `https://picsum.photos/seed/${pkg.id}/400/200`}
                  alt={pkg.packageName}
                  sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                  onError={(e) => { e.target.src = `https://picsum.photos/seed/${pkg.id}/400/200`; }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{pkg.packageName}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    📍 {pkg.place?.placeName} | ⏱ {pkg.duration}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Price per person</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{pkg.price?.toLocaleString('en-IN')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Persons</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>× {form.numberOfPersons}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>Total Amount</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        ₹{totalPrice.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      ✅ Free cancellation within 24 hours of booking
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BookingPage;
