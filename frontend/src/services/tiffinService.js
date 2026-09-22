import API from './api';

export const getAllTiffins = async () => {
  const response = await API.get('/tiffins');
  return response.data;
};

export const createTiffin = async (tiffinData) => {
  const response = await API.post('/tiffins', tiffinData);
  return response.data;
};