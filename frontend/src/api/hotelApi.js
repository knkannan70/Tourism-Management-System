import axiosInstance from './axiosInstance';

// Public hotel API
export const getHotels = (params) => axiosInstance.get('/hotels', { params });
export const getHotelById = (id) => axiosInstance.get(`/hotels/${id}`);
export const searchHotels = (q) => axiosInstance.get('/hotels', { params: { search: q } });
export const getHotelsByState = (stateId) => axiosInstance.get('/hotels', { params: { stateId } });
export const getHotelsByDistrict = (districtId) => axiosInstance.get('/hotels', { params: { districtId } });

// Hotel reviews
export const getHotelReviews = (hotelId) => axiosInstance.get(`/hotels/${hotelId}/reviews`);
export const addHotelReview = (hotelId, data) => axiosInstance.post(`/hotels/${hotelId}/reviews`, data);
export const updateHotelReview = (reviewId, data) => axiosInstance.put(`/hotels/reviews/${reviewId}`, data);
export const deleteHotelReview = (reviewId) => axiosInstance.delete(`/hotels/reviews/${reviewId}`);

// Admin hotel management
export const adminCreateHotel = (data) => axiosInstance.post('/admin/hotels', data);
export const adminUpdateHotel = (id, data) => axiosInstance.put(`/admin/hotels/${id}`, data);
export const adminDeleteHotel = (id) => axiosInstance.delete(`/admin/hotels/${id}`);
export const adminUploadHotelImage = (id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return axiosInstance.post(`/admin/hotels/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
