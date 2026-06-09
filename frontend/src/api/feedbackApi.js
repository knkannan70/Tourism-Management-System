import axiosInstance from './axiosInstance';

export const getAllFeedback = () => axiosInstance.get('/feedback');
export const submitFeedback = (data) => axiosInstance.post('/feedback', data);
export const adminGetFeedback = () => axiosInstance.get('/admin/feedback');
export const adminDeleteFeedback = (id) => axiosInstance.delete(`/admin/feedback/${id}`);
export const adminApproveFeedback = (id) => axiosInstance.put(`/admin/feedback/${id}/approve`);
export const adminRejectFeedback = (id) => axiosInstance.put(`/admin/feedback/${id}/reject`);

