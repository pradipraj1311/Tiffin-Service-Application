import { useEffect, useState } from "react";
import API from '../services/api';

export default function Earnings() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/chef');
      setOrders(data);
    } catch (error) {
      console.error("Error fetching earnings data", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCompactNumber = (number) => {
    return new Intl.NumberFormat('en-IN', { notation: "compact", maximumFractionDigits: 1 }).format(number);
  };

  if (loading) return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Calculating Earnings...</div>;

  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  const now = new Date();
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  
  const lifetimeEarnings = deliveredOrders.reduce((sum, o) => sum + ((o.post_MenuId?.price || 0) * o.orderQuantity), 0);
  const todayEarnings = deliveredOrders.filter(o => new Date(o.createdAt).getTime() >= startOfToday).reduce((sum, o) => sum + ((o.post_MenuId?.price || 0) * o.orderQuantity), 0);
  const monthEarnings = deliveredOrders.filter(o => new Date(o.createdAt).getTime() >= startOfMonth).reduce((sum, o) => sum + ((o.post_MenuId?.price || 0) * o.orderQuantity), 0);

  const totalDelivered = deliveredOrders.length;
  const totalCancelled = orders.filter(o => o.status === 'Cancelled').length;

  return (
    <div className="container" style={{ maxWidth: '1000px', marginTop: '30px', paddingBottom: '50px' }}>
      <h2 style={{ marginBottom: '5px', color: '#333' }}>Business Analytics</h2>
      <p style={{ color: '#777', marginBottom: '30px' }}>Track your revenue and delivery performance.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        <div style={{ background: 'linear-gradient(135deg, #28a745, #218838)', padding: '30px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '15px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Lifetime Revenue</p>
          <h2 style={{ margin: 0, fontSize: '48px' }}>₹{formatCompactNumber(lifetimeEarnings)}</h2>
          <p style={{ margin: '10px 0 0 0', fontSize: '13px', opacity: 0.8 }}>Total earned since joining.</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #007bff, #0056b3)', padding: '30px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '15px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>This Month</p>
          <h2 style={{ margin: 0, fontSize: '48px' }}>₹{formatCompactNumber(monthEarnings)}</h2>
          <p style={{ margin: '10px 0 0 0', fontSize: '13px', opacity: 0.8 }}>Revenue since {new Date(startOfMonth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.</p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        <div style={{ background: 'white', border: '1px solid #eaeaea', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#777', textTransform: 'uppercase', fontWeight: 'bold' }}>Today's Revenue</p>
          <h3 style={{ margin: 0, fontSize: '28px', color: '#333' }}>₹{formatCompactNumber(todayEarnings)}</h3>
        </div>

        <div style={{ background: 'white', border: '1px solid #eaeaea', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#777', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Deliveries</p>
          <h3 style={{ margin: 0, fontSize: '28px', color: '#28a745' }}>{formatCompactNumber(totalDelivered)}</h3>
        </div>

        <div style={{ background: 'white', border: '1px solid #eaeaea', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#777', textTransform: 'uppercase', fontWeight: 'bold' }}>Cancelled Orders</p>
          <h3 style={{ margin: 0, fontSize: '28px', color: '#dc3545' }}>{formatCompactNumber(totalCancelled)}</h3>
        </div>

      </div>
    </div>
  );
}