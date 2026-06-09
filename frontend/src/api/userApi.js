import axiosInstance from './axiosInstance';

// Use /users/profile endpoints (backend now has both /me and /profile aliases)
export const getProfile = () => axiosInstance.get('/users/profile');
export const updateProfile = (data) => axiosInstance.put('/users/profile', data);
export const uploadProfileImage = (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return axiosInstance.post('/users/profile/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const changePassword = (data) => axiosInstance.put('/users/me/password', data);
