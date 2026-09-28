import API from "./api";

export const createPayment = async (paymentData) => {
  const response = await API.post("/payments", paymentData);
  return response.data;
};

export const getPaymentStatus = async (paymentId) => {
  const response = await API.get(`/payments/${paymentId}/status`);
  return response.data;
};
