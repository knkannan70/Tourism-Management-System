import axiosInstance from './axiosInstance';

// Public place API
export const getPlaces = (params) => axiosInstance.get('/places', { params });
export const getPlaceById = (id) => axiosInstance.get(`/places/${id}`);
export const searchPlaces = (q) => axiosInstance.get('/places', { params: { search: q } });
export const getPlacesByState = (stateId) => axiosInstance.get('/places', { params: { stateId } });
export const getPlacesByDistrict = (districtId) => axiosInstance.get('/places', { params: { districtId } });
export const getPlacesByCategory = (categoryId) => axiosInstance.get('/places', { params: { categoryId } });

// Place reviews
export const getPlaceReviews = (placeId) => axiosInstance.get(`/places/${placeId}/reviews`);
export const addPlaceReview = (placeId, data) => axiosInstance.post(`/places/${placeId}/reviews`, data);
export const updatePlaceReview = (reviewId, data) => axiosInstance.put(`/places/reviews/${reviewId}`, data);
export const deletePlaceReview = (reviewId) => axiosInstance.delete(`/places/reviews/${reviewId}`);

// Admin place management
export const adminCreatePlace = (data) => axiosInstance.post('/admin/places', data);
export const adminUpdatePlace = (id, data) => axiosInstance.put(`/admin/places/${id}`, data);
export const adminDeletePlace = (id) => axiosInstance.delete(`/admin/places/${id}`);
export const adminUploadPlaceImage = (id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return axiosInstance.post(`/admin/places/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
