import API from './api';

export const createOrder = async (orderData) => {
  const response = await API.post('/orders', orderData);
  return response.data;
};

export const getUserOrders = async () => {
  const response = await API.get('/orders');
  return response.data;
};

export const cancelOrder = async (id) => {
  const response = await API.delete(`/orders/${id}`);
  return response.data;
};
