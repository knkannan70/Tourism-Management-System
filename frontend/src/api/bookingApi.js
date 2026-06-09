import axiosInstance from './axiosInstance';

export const createBooking = (data) => axiosInstance.post('/bookings', data);
export const getMyBookings = () => axiosInstance.get('/bookings/my');
export const cancelBooking = (id) => axiosInstance.put(`/bookings/${id}/cancel`);
export const userDeleteBooking = (id) => axiosInstance.delete(`/bookings/${id}`);
export const adminGetAllBookings = () => axiosInstance.get('/admin/bookings');
export const adminUpdateBookingStatus = (id, status) =>
  axiosInstance.put(`/admin/bookings/${id}/status`, { status });
export const adminDeleteBooking = (id) => axiosInstance.delete(`/admin/bookings/${id}`);
