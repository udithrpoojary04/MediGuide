import api from './api';

const getNearbyFacilities = async (params) => {
  // params: { lat, lng, address, radius, type }
  const response = await api.get('/healthcare/nearby', { params });
  return response.data;
};

export default {
  getNearbyFacilities
};
