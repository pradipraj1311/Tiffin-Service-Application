import { useState, useEffect } from 'react';
import API from '../services/api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/my-orders');
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Loading your orders...</div>;

  return (
    <div className="container" style={{ marginTop: '30px', maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '20px' }}>My Orders</h2>
      
      {orders.length === 0 ? (
        <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#777', fontSize: '16px' }}>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map(order => (
            <div key={order._id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Order #{order._id.slice(-6).toUpperCase()}</span>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#777' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                <span style={{ 
                  background: order.status === 'Delivered' ? '#e8f5e9' : '#fff3cd', 
                  color: order.status === 'Delivered' ? '#28a745' : '#856404', 
                  padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: `1px solid ${order.status === 'Delivered' ? '#c3e6cb' : '#ffe8a1'}`
                }}>
                  {order.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '0 0 5px 0' }}><strong>Quantity:</strong> {order.orderQuantity} Tiffin(s)</p>
                <p style={{ margin: '0' }}><strong>Payment Method:</strong> {order.paymentId === 'COD' ? 'Cash on Delivery' : 'Paid Online'}</p>
              </div>
              
              {order.status !== 'Delivered' && (
                <div style={{ background: '#e2f0ff', border: '2px dashed #007bff', padding: '20px', borderRadius: '8px', textAlign: 'center', marginTop: '15px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0056b3', fontWeight: 'bold' }}>Give this OTP to the Chef upon delivery</p>
                  <h2 style={{ margin: 0, letterSpacing: '8px', color: '#007bff', fontSize: '32px' }}>{order.deliveryOTP}</h2>
                </div>
              )}
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}