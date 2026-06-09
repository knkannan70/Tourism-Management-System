import axiosInstance from './axiosInstance';

export const getPackages = (params) => axiosInstance.get('/packages', { params });
export const getPackageById = (id) => axiosInstance.get(`/packages/${id}`);
export const getPlaces = () => axiosInstance.get('/places');
export const getPlaceById = (id) => axiosInstance.get(`/places/${id}`);
export const getHotels = () => axiosInstance.get('/hotels');
export const getHotelById = (id) => axiosInstance.get(`/hotels/${id}`);
export const getHotelsByPlace = (placeId) => axiosInstance.get(`/hotels/by-place/${placeId}`);
export const getCategories = () => axiosInstance.get('/categories');
export const getStates = () => axiosInstance.get('/states');
export const getDistrictsByState = (stateId) => axiosInstance.get(`/states/${stateId}/districts`);
export const getAllDistricts = () => axiosInstance.get('/districts');
export const getPlacesByDistrict = (districtId) => axiosInstance.get('/places', { params: { districtId } });

// Admin
export const adminCreatePackage = (data) => axiosInstance.post('/admin/packages', data);
export const adminUpdatePackage = (id, data) => axiosInstance.put(`/admin/packages/${id}`, data);
export const adminDeletePackage = (id) => axiosInstance.delete(`/admin/packages/${id}`);
export const adminUploadPackageImage = (id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return axiosInstance.post(`/admin/packages/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const adminCreatePlace = (data) => axiosInstance.post('/admin/places', data);
export const adminUpdatePlace = (id, data) => axiosInstance.put(`/admin/places/${id}`, data);
export const adminDeletePlace = (id) => axiosInstance.delete(`/admin/places/${id}`);
export const adminUploadPlaceImage = (id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return axiosInstance.post(`/admin/places/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const adminUploadPlaceGalleryImage = (id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return axiosInstance.post(`/admin/places/${id}/gallery`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const adminCreateHotel = (data) => axiosInstance.post('/admin/hotels', data);
export const adminUpdateHotel = (id, data) => axiosInstance.put(`/admin/hotels/${id}`, data);
export const adminDeleteHotel = (id) => axiosInstance.delete(`/admin/hotels/${id}`);
export const adminUploadHotelImage = (id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return axiosInstance.post(`/admin/hotels/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const adminUploadHotelGalleryImage = (id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return axiosInstance.post(`/admin/hotels/${id}/gallery`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const adminCreateCategory = (data) => axiosInstance.post('/admin/categories', data);
export const adminUpdateCategory = (id, data) => axiosInstance.put(`/admin/categories/${id}`, data);
export const adminDeleteCategory = (id) => axiosInstance.delete(`/admin/categories/${id}`);
