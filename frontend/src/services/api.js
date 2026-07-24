import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

export const getMedicines = (params = {}) => API.get('/medicines', { params });
export const getMedicine  = (id)          => API.get(`/medicines/${id}`);
export const getAlerts    = ()            => API.get('/medicines/alerts');
export const createMedicine = (data)      => API.post('/medicines', data);
export const updateMedicine = (id, data)  => API.put(`/medicines/${id}`, data);
export const deleteMedicine = (id)        => API.delete(`/medicines/${id}`);

export default API;
