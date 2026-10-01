import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function Subscriptions() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    const res = await loadRazorpayScript();

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const orderRes = await API.post('/subscriptions/create-order');
      const orderData = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy', 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Tiffin Service Platform',
        description: 'Premium Chef Subscription (1 Month)',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            await API.post('/subscriptions/verify-payment', response);
            alert('Payment Successful! Welcome to Premium.');
            await refreshUser(); 
            navigate('/dashboard'); 
          } catch (err) {
            alert('Payment verification failed on server.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.PhoneNumber || '9999999999'
        },
        theme: { color: '#28a745' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.isSubscribed) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>🎉 You are already Subscribed!</h2>
        <p>Your Premium access is active. Go to the Dashboard to manage menus.</p>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', background: '#007bff', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px', marginTop: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#333' }}>Grow Your Tiffin Business</h1>
        <p style={{ color: '#666', fontSize: '18px' }}>Activate your Premium Workspace to start accepting orders from thousands of customers.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '400px', borderTop: '6px solid #28a745', padding: '30px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Premium Tier</h2>
          <h3 style={{ fontSize: '36px', color: '#28a745', margin: '10px 0' }}>₹1,999<span style={{ fontSize: '16px', color: '#777' }}> / month</span></h3>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '30px 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>✅ <span style={{ fontWeight: 'bold' }}>Unlimited Menu Publications</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>✅ <span>Zero Platform Commission</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>✅ <span>Dynamic 7km radius visibility</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>✅ <span>Secure Razorpay payouts</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>✅ <span>4-Digit OTP Delivery verification</span></li>
          </ul>

          <button 
            onClick={handlePayment} 
            disabled={loading || user?.verificationStatus !== 'Approved'}
            style={{ 
              width: '100%', 
              padding: '15px', 
              background: user?.verificationStatus === 'Approved' ? '#28a745' : '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              cursor: user?.verificationStatus === 'Approved' ? 'pointer' : 'not-allowed'
            }}
          >
            {loading ? 'Processing...' : (user?.verificationStatus === 'Approved' ? 'Pay Securely with Razorpay' : 'Requires Admin Approval First')}
          </button>
          
          {user?.verificationStatus !== 'Approved' && (
            <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '15px' }}>Complete your Profile and wait for Admin verification before subscribing.</p>
          )}
        </div>
      </div>
    </div>
  );
}