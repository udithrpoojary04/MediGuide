import api from './api';

const sendMessage = async (messages) => {
  const response = await api.post('/symptoms/message', { messages });
  return response.data;
};

const saveReport = async (conversation, result) => {
  const response = await api.post('/symptoms/save', { conversation, result });
  return response.data;
};

const getHistory = async () => {
  const response = await api.get('/symptoms/history');
  return response.data;
};

const getReport = async (id) => {
  const response = await api.get(`/symptoms/${id}`);
  return response.data;
};

const deleteReport = async (id) => {
  const response = await api.delete(`/symptoms/${id}`);
  return response.data;
};

const deleteAllHistory = async () => {
  const response = await api.delete('/symptoms/history');
  return response.data;
};

export default {
  sendMessage,
  saveReport,
  getHistory,
  getReport,
  deleteReport,
  deleteAllHistory
};
