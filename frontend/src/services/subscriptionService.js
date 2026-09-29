import API from './api';

export const getPlans = async () => {
  const response = await API.get('/subscriptions/plans');
  return response.data;
};

export const subscribeToPlan = async () => {
  const response = await API.post('/subscriptions');
  return response.data;
};