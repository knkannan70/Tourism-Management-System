import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import FeedbackPage from './pages/FeedbackPage';
import ProfilePage from './pages/ProfilePage';
import Wishlist from './pages/Wishlist';
import PlacesPage from './pages/Places';
import PlaceDetail from './pages/PlaceDetail';
import HotelsPage from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManagePlaces from './pages/admin/ManagePlaces';
import ManageHotels from './pages/admin/ManageHotels';
import ManagePackages from './pages/admin/ManagePackages';
import ManageBookings from './pages/admin/ManageBookings';
import ManageFeedback from './pages/admin/ManageFeedback';
import ManageCategories from './pages/admin/ManageCategories';
import Reports from './pages/admin/Reports';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes with Navbar */}
      <Route element={<Navbar />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/packages/:id" element={<PackageDetail />} />
        <Route path="/places" element={<PlacesPage />} />
        <Route path="/places/:id" element={<PlaceDetail />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/hotels/:id" element={<HotelDetail />} />

        {/* User protected routes */}
        <Route element={<ProtectedRoute role="USER" />}>
          <Route path="/booking/:packageId" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/places" element={<ManagePlaces />} />
          <Route path="/admin/hotels" element={<ManageHotels />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/packages" element={<ManagePackages />} />
          <Route path="/admin/bookings" element={<ManageBookings />} />
          <Route path="/admin/feedback" element={<ManageFeedback />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
