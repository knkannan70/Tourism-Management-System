import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Button,
  TextField, InputAdornment, Tab, Tabs
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';
import CategoryIcon from '@mui/icons-material/Category';
import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRevenueReport, getBookingReport, getDashboardStats } from '../../api/adminApi';

const Reports = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Search filters for the different tables
  const [packageSearch, setPackageSearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  const loadReports = async () => {
    try {
      const [revRes, bookRes, dashRes] = await Promise.all([
        getRevenueReport(),
        getBookingReport(),
        getDashboardStats()
      ]);
      setRevenueData(revRes.data.data || []);
      setBookingData(bookRes.data.data || []);
      setDashboardData(dashRes.data.data || null);
    } catch (err) {
      setError('Failed to fetch analytics reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const exportToExcel = (data, headers, keys, filename) => {
    if (!data || data.length === 0) return;
    const csvHeaders = headers.join(",");
    const rows = data.map(row => 
      keys.map(key => {
        const val = row[key];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : (val === null || val === undefined ? '' : val);
      }).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [csvHeaders, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  // Filtered lists
  const filteredBookings = bookingData.filter(b => 
    b.packageName?.toLowerCase().includes(packageSearch.toLowerCase())
  );

  const filteredStates = (dashboardData?.stateAnalytics || []).filter(s => 
    s.stateName?.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredDistricts = (dashboardData?.districtAnalytics || []).filter(d => 
    d.districtName?.toLowerCase().includes(districtSearch.toLowerCase()) ||
    d.stateName?.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <Box className="print-container">
      {/* Print styles block */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav, header, .MuiDrawer-root, .MuiAppBar-root, .no-print, button, .MuiTabs-root {
            display: none !important;
          }
          .MuiBox-root {
            margin: 0 !important;
            padding: 0 !important;
          }
          main, .print-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          .MuiCard-root {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            margin-bottom: 20px !important;
            break-inside: avoid !important;
          }
        }
      `}} />

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Reports & Analytics</Typography>
          <Typography color="text.secondary">Detailed financial performance, location metrics and category breakdowns.</Typography>
        </Box>
        <Box className="no-print" sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<GetAppIcon />}
            onClick={() => exportToExcel(
              bookingData, 
              ['Tour Package Name', 'Total Bookings Count', 'Confirmed Revenue Generated'],
              ['packageName', 'bookingsCount', 'revenue'],
              'package_bookings_report'
            )}
          >
            Export Packages
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PrintIcon />}
            onClick={exportToPDF}
          >
            Print / PDF Report
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Revenue Chart */}
        <Grid item xs={12} className="no-print">
          <Card sx={{ height: 400 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TrendingUpIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Monthly Confirmed Revenue</Typography>
              </Box>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography color="text.secondary">No confirmed revenue data available.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tab Selection for Analytics Tables */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newVal) => setActiveTab(newVal)} 
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Package Metrics" icon={<AssessmentIcon />} iconPosition="start" />
                <Tab label="State-wise Metrics" icon={<PublicIcon />} iconPosition="start" />
                <Tab label="District-wise Metrics" icon={<MapIcon />} iconPosition="start" />
                <Tab label="Category Statistics" icon={<CategoryIcon />} iconPosition="start" />
              </Tabs>

              {/* TAB 0: Package Metrics */}
              {activeTab === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }} className="no-print">
                    <TextField
                      placeholder="Search package..."
                      value={packageSearch}
                      onChange={(e) => setPackageSearch(e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#94a3b8' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  {filteredBookings.length > 0 ? (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'background.default' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Tour Package Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Total Bookings Count</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Confirmed Revenue Generated</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredBookings.map((row, index) => (
                            <TableRow key={index} hover>
                              <TableCell sx={{ fontWeight: 500 }}>{row.packageName}</TableCell>
                              <TableCell align="center">{row.bookingsCount}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                                ₹{(row.revenue || 0).toLocaleString('en-IN')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                      <Typography color="text.secondary">No bookings matching search query.</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* TAB 1: State-wise Metrics */}
              {activeTab === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }} className="no-print">
                    <TextField
                      placeholder="Search state..."
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#94a3b8' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GetAppIcon />}
                      onClick={() => exportToExcel(
                        dashboardData?.stateAnalytics || [],
                        ['State ID', 'State Name', 'Places Count', 'Bookings Count'],
                        ['id', 'stateName', 'placesCount', 'bookingsCount'],
                        'state_analytics_report'
                      )}
                    >
                      Export States CSV
                    </Button>
                  </Box>
                  {filteredStates.length > 0 ? (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'background.default' }}>
                            <TableCell sx={{ fontWeight: 600 }}>State ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>State Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Tourist Places Count</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Bookings Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredStates.map((row) => (
                            <TableRow key={row.id} hover>
                              <TableCell>{row.id}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{row.stateName}</TableCell>
                              <TableCell align="center">{row.placesCount}</TableCell>
                              <TableCell align="center">{row.bookingsCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                      <Typography color="text.secondary">No states found.</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* TAB 2: District-wise Metrics */}
              {activeTab === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }} className="no-print">
                    <TextField
                      placeholder="Search district or state..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#94a3b8' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GetAppIcon />}
                      onClick={() => exportToExcel(
                        dashboardData?.districtAnalytics || [],
                        ['District ID', 'District Name', 'State Name', 'Places Count', 'Bookings Count'],
                        ['id', 'districtName', 'stateName', 'placesCount', 'bookingsCount'],
                        'district_analytics_report'
                      )}
                    >
                      Export Districts CSV
                    </Button>
                  </Box>
                  {filteredDistricts.length > 0 ? (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'background.default' }}>
                            <TableCell sx={{ fontWeight: 600 }}>District ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>District Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>State Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Tourist Places Count</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Bookings Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredDistricts.map((row) => (
                            <TableRow key={row.id} hover>
                              <TableCell>{row.id}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{row.districtName}</TableCell>
                              <TableCell>{row.stateName}</TableCell>
                              <TableCell align="center">{row.placesCount}</TableCell>
                              <TableCell align="center">{row.bookingsCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                      <Typography color="text.secondary">No districts found.</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* TAB 3: Category Statistics */}
              {activeTab === 3 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }} className="no-print">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GetAppIcon />}
                      onClick={() => exportToExcel(
                        dashboardData?.categoryAnalytics || [],
                        ['Category ID', 'Category Name', 'Tourist Places Count'],
                        ['id', 'categoryName', 'placesCount'],
                        'category_analytics_report'
                      )}
                    >
                      Export Categories CSV
                    </Button>
                  </Box>
                  {(dashboardData?.categoryAnalytics || []).length > 0 ? (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'background.default' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Category ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Category Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Tourist Places Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.categoryAnalytics.map((row) => (
                            <TableRow key={row.id} hover>
                              <TableCell>{row.id}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{row.categoryName}</TableCell>
                              <TableCell align="center">{row.placesCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                      <Typography color="text.secondary">No category data available.</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
