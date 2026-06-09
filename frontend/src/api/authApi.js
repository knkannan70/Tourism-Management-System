import axiosInstance from './axiosInstance';

export const registerUser = (data) => axiosInstance.post('/auth/register', data);
export const loginUser = (data) => axiosInstance.post('/auth/login', data);
export const loginAdmin = (data) => axiosInstance.post('/auth/admin/login', data);
export const resetPassword = (data) => axiosInstance.post('/auth/reset-password', data);
