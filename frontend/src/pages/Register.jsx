import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ role: 'Customer', name: '', email: '', password: '', phone: '' });
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', formData); 
      setRegisteredEmail(formData.email); 
      setIsSuccess(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleResend = async () => {
    try {
      setResendStatus('Sending...');
      await API.post('/auth/resend-verification', { email: registeredEmail });
      setResendStatus('Email resent successfully! Please check your inbox.');
    } catch (error) {
      setResendStatus(error.response?.data?.message || 'Failed to resend email. Please try again.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
      
      {isSuccess ? (
        <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>✉️</div>
          <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Check your inbox!</h2>
          <p style={{ color: '#555', fontSize: '15px' }}>
            We've sent a secure verification link to <br/>
            <strong>{registeredEmail}</strong>
          </p>
          
          <div style={{ margin: '30px 0', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <button 
              onClick={handleResend} 
              style={{ width: '100%', maxWidth: '250px', padding: '12px', background: '#e9ecef', color: '#333', border: '1px solid #ced4da', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🔄 Resend Email
            </button>
            {resendStatus && (
              <small style={{ color: resendStatus.includes('successfully') ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                {resendStatus}
              </small>
            )}
            
            <Link to="/login" style={{ width: '100%', maxWidth: '250px', textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                ⬅ Back to Login
              </button>
            </Link>
          </div>
          
          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
            Didn't receive it? Check your spam folder or <a href="#" style={{ color: '#007bff' }}>contact support</a>.
          </p>
        </div>
      ) : (
        <>
          <h2 style={{ textAlign: 'center', color: '#333' }}>Create an Account</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '-10px' }}>I want to...</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="Customer">Order Food (Customer)</option>
              <option value="Chef">Cook & Sell (Chef)</option>
            </select>

            <input type="text" placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <input type="email" placeholder="Email Address" onChange={(e) => setFormData({...formData, email: e.target.value})} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <input type="tel" placeholder="Phone Number" onChange={(e) => setFormData({...formData, phone: e.target.value})} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <input type="password" placeholder="Password (Min 6 characters)" minLength="6" onChange={(e) => setFormData({...formData, password: e.target.value})} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
            
            <button type="submit" style={{ padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
              Register
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
              Already have an account? <Link to="/login" style={{ color: '#007bff' }}>Login here</Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
}