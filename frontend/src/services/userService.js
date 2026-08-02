import api from './api';

const updateProfile = async (userData) => {
  const response = await api.put('/user/profile', userData);
  if (response.data.success) {
    // Update local storage token if user details changed (usually token doesn't change unless we reissue, but here we might just keep existing token, or update user object in LS)
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const updatedUser = { ...currentUser, ...response.data.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  return response.data;
};

const deleteAccount = async () => {
  const response = await api.delete('/user/account');
  if (response.data.success) {
    localStorage.removeItem('user');
  }
  return response.data;
};

export default {
  updateProfile,
  deleteAccount
};
