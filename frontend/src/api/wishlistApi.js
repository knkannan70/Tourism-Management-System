import axiosInstance from './axiosInstance';

export const getWishlist = () => axiosInstance.get('/wishlist');
export const addToWishlist = (packageId) => axiosInstance.post(`/wishlist/${packageId}`);
export const removeFromWishlist = (packageId) => axiosInstance.delete(`/wishlist/${packageId}`);
export const checkWishlistStatus = (packageId) => axiosInstance.get(`/wishlist/${packageId}/status`);
