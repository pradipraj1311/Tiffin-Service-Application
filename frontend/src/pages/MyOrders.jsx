import { useEffect, useState } from 'react';
import { getUserOrders, cancelOrder } from '../services/orderService';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getUserOrders();
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedData);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(orderId);
      setOrders(orders.filter((order) => order._id !== orderId));
      alert('Order cancelled successfully.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h2>My Order History</h2>
      {orders.length === 0 ? <p>You have no orders yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.map((order) => (
            <div key={order._id} className="card" style={{ borderLeft: '5px solid #007bff' }}>
              
              {/* <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p><strong>Order ID:</strong> {order._id.substring(0, 8)}...</p>
                <p style={{ color: 'gray' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div> */}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <p style={{ margin: 0 }}><strong>Order ID:</strong> {order._id.substring(0, 8)}...</p>
    <span style={{ 
      background: order.status === 'Delivered' ? '#d4edda' : '#fff3cd', 
      color: order.status === 'Delivered' ? '#155724' : '#856404',
      padding: '4px 12px', 
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold'
    }}>
      {order.status || 'Pending'}
    </span>
  </div>


              <p><strong>Total Price:</strong> ₹{order.orderQuantity * 150}</p>
              <p><strong>Menu:</strong> {order.post_MenuId?.MealTypes?.join(', ')}</p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={() => handleCancel(order._id)} style={{ background: '#dc3545', color: 'white' }}>
                  Cancel Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}