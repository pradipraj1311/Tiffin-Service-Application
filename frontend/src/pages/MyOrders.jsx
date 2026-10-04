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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await API.delete(`/orders/${orderId}`);
      alert("Order successfully cancelled.");
      fetchOrders(); 
    } catch (error) {
      alert(`Failed to cancel order: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRateOrder = async (orderId) => {
    const rating = window.prompt("Rate this meal from 1 to 5 stars:", "5");
    if (!rating) return;
    
    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) return alert("Please enter a valid number between 1 and 5.");

    try {
      await API.post(`/orders/${orderId}/rate`, { rating: numRating });
      alert("Thank you for your rating!");
      fetchOrders(); 
    } catch (error) {
      alert(`Failed to submit rating: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Loading your orders...</div>;

  return (
    <div className="container" style={{ marginTop: '30px', maxWidth: '800px', paddingBottom: '50px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Order History</h2>
      
      {orders.length === 0 ? (
        <div style={{ background: 'white', padding: '60px 20px', textAlign: 'center', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '40px' }}>🍽️</span>
          <h3 style={{ margin: '15px 0 10px 0', color: '#333' }}>No orders yet</h3>
          <p style={{ color: '#777', fontSize: '16px', margin: 0 }}>Looks like you haven't ordered any delicious home-cooked meals.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => {
            const menu = order.post_MenuId;
            const kitchenName = menu?.CustomerId?.businessName || 'Local Tiffin Kitchen';
            const totalAmount = menu?.price * order.orderQuantity;
            const isDelivered = order.status === 'Delivered';

            return (
              <div key={order._id} style={{ border: '1px solid #eaeaea', borderRadius: '12px', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #eaeaea' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>ORDER #{order._id.slice(-8).toUpperCase()}</span>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#888' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <span style={{ 
                    background: isDelivered ? '#e8f5e9' : (order.status === 'Cancelled' ? '#ffebee' : '#fff3cd'), 
                    color: isDelivered ? '#28a745' : (order.status === 'Cancelled' ? '#dc3545' : '#856404'), 
                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {order.status}
                  </span>
                </div>
                
                <div style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '80px', height: '80px', background: '#f1f1f1', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px' }}>
                    🍲
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>{kitchenName}</h3>
                    
                    {menu ? (
                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}>
                          <span style={{ color: menu.MenuList[0]?.veg ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                            {menu.MenuList[0]?.veg ? '🟢 VEG' : '🔴 NON-VEG'}
                          </span>
                          {' '}• {menu.MealTypes.join(', ')}
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#777' }}>
                          {menu.MenuList.map(m => m.MealNames.join(', ')).join(' | ')}
                        </p>
                      </div>
                    ) : (
                      <p style={{ color: '#dc3545', fontSize: '14px' }}>Menu details unavailable (Item deleted by Chef)</p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #eaeaea', paddingTop: '15px' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                        <strong>{order.orderQuantity}</strong> x ₹{menu?.price || 0}
                      </p>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                        Total: ₹{totalAmount || 0}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ background: '#fafafa', padding: '15px 20px', borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    Payment: <strong style={{ color: '#333' }}>{order.paymentId === 'COD' ? 'Cash on Delivery' : 'Paid Online'}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {order.status === 'Pending' && (
                      <button 
                        onClick={() => handleCancelOrder(order._id)}
                        style={{ background: 'transparent', color: '#dc3545', border: '1px solid #dc3545', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Cancel Order
                      </button>
                    )}

                    {!isDelivered && order.status !== 'Cancelled' ? (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 3px 0', fontSize: '11px', color: '#e23744', fontWeight: 'bold', textTransform: 'uppercase' }}>Delivery PIN</p>
                        <h2 style={{ margin: 0, letterSpacing: '4px', color: '#333', fontSize: '24px', background: '#ffebee', padding: '4px 12px', borderRadius: '6px', border: '1px solid #ffcdd2' }}>
                          {order.deliveryOTP}
                        </h2>
                      </div>
                    ) : (
                      isDelivered && !order.isRated && (
                        <button 
                          onClick={() => handleRateOrder(order._id)}
                          style={{ background: 'white', color: '#28a745', border: '1px solid #28a745', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                        >
                          ⭐ Rate Chef
                        </button>
                      )
                    )}
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}