import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        await API.get(`/auth/verify-email/${token}`);
        setStatus('Email verified successfully! You can now log in.');
      } catch (error) {
        setStatus(error.response?.data?.message || 'Verification failed. Link may be invalid or expired.');
      }
    };
    verifyUserEmail();
  }, [token]);

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '8px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2>Email Verification</h2>
        <p style={{ fontSize: '18px', margin: '20px 0', color: status.includes('successfully') ? '#28a745' : '#dc3545' }}>
          {status}
        </p>
        <Link to="/login">
          <button style={{ background: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Go to Login
          </button>
        </Link>
      </div>
    </div>
  );
}