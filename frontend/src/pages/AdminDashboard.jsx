import { useEffect, useState } from 'react';
import API from '../services/api';

export default function AdminDashboard() {
  const [pendingChefs, setPendingChefs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingChefs();
  }, []);

  const fetchPendingChefs = async () => {
    try {
      const response = await API.get('/admin/pending-chefs');
      setPendingChefs(response.data);
    } catch (error) {
      console.error('Failed to fetch chefs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (chefId, status) => {
    if (!window.confirm(`Are you sure you want to mark this Chef as ${status}?`)) return;
    
    try {
      await API.put('/admin/verify-chef', { chefId, status });
      alert(`Chef successfully ${status}`);
      setPendingChefs(pendingChefs.filter(chef => chef._id !== chefId));
    } catch (error) {
      alert(error.response?.data?.message || 'Verification update failed');
    }
  };

  if (loading) return <div>Loading Admin Panel...</div>;

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <h2>Admin Dashboard: FSSAI Verifications</h2>
      
      {pendingChefs.length === 0 ? (
        <div style={{ padding: '20px', background: '#d4edda', color: '#155724', borderRadius: '8px', marginTop: '20px' }}>
        There are no Chefs waiting for verification.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {pendingChefs.map(chef => (
            <div key={chef._id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                
                <div>
                  <h3 style={{ margin: '0 0 10px 0' }}>{chef.businessName || 'Unnamed Kitchen'}</h3>
                  <p style={{ margin: '5px 0' }}><strong>Owner:</strong> {chef.name}</p>
                  <p style={{ margin: '5px 0' }}><strong>Email:</strong> {chef.email}</p>
                  <p style={{ margin: '5px 0' }}><strong>Phone:</strong> {chef.PhoneNumber}</p>
                  <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '6px', marginTop: '10px', borderLeft: '4px solid #007bff' }}>
                    <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '16px' }}>
                      <strong>FSSAI License:</strong> {chef.fssai}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={() => handleVerification(chef._id, 'Approved')} 
                    style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✅ Approve Chef
                  </button>
                  <button 
                    onClick={() => handleVerification(chef._id, 'Rejected')} 
                    style={{ background: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ❌ Reject
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}