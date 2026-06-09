import axiosInstance from './axiosInstance';

export const getDashboardStats = () => axiosInstance.get('/admin/dashboard');
export const getRevenueReport = () => axiosInstance.get('/admin/reports/revenue');
export const getBookingReport = () => axiosInstance.get('/admin/reports/bookings');
export const getAllUsers = () => axiosInstance.get('/admin/users');
export const updateUser = (id, data) => axiosInstance.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => axiosInstance.delete(`/admin/users/${id}`);
export const createUser = (data) => axiosInstance.post('/admin/users', data);
export const disableUser = (id) => axiosInstance.put(`/admin/users/${id}/disable`);
export const enableUser = (id) => axiosInstance.put(`/admin/users/${id}/enable`);

// Reviews
export const adminGetPlaceReviews = () => axiosInstance.get('/admin/place-reviews');
export const adminDeletePlaceReview = (id) => axiosInstance.delete(`/admin/place-reviews/${id}`);
export const adminApprovePlaceReview = (id, isApproved) => axiosInstance.put(`/admin/place-reviews/${id}/approve?isApproved=${isApproved}`);
export const adminGetHotelReviews = () => axiosInstance.get('/admin/hotel-reviews');
export const adminDeleteHotelReview = (id) => axiosInstance.delete(`/admin/hotel-reviews/${id}`);
export const adminApproveHotelReview = (id, isApproved) => axiosInstance.put(`/admin/hotel-reviews/${id}/approve?isApproved=${isApproved}`);

