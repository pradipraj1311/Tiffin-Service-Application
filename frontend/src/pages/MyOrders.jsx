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
      setOrders(data);
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
    <div>
      <h2>My Orders</h2>
      {orders.length === 0 ? <p>You have no orders yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Quantity:</strong> {order.orderQuantity}</p>
              <p><strong>Menu:</strong> {order.post_MenuId?.MealTypes?.join(', ')}</p>
              <button onClick={() => handleCancel(order._id)} style={{ background: 'red', color: 'white' }}>
                Cancel Order
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}