import API from './api';

export const getAllTiffins = async (params={}) => {
  const response = await API.get('/tiffins', { params });
  return response.data;
};

export const createTiffin = async (tiffinData) => {
  const response = await API.post('/tiffins', tiffinData);
  return response.data;
};
export const updateTiffin = async (id, tiffinData) => {
  const response = await API.put(`/tiffins/${id}`, tiffinData);
  return response.data;
};

export const deleteTiffin = async (id) => {
  const response = await API.delete(`/tiffins/${id}`);
  return response.data;
};