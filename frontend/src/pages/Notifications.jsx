import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function Notifications() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAsRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try { await API.put('/notifications/read'); } catch (e) { }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    try {
      await API.delete('/notifications/clear');
      setNotifications([]);
    } catch (error) {
      alert("Failed to clear notifications.");
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.relatedOrderId) return;
    
    const targetPage = user.role === 'Chef' ? '/incoming-orders' : '/my-orders';
    navigate(`${targetPage}?highlight=${notif.relatedOrderId}`);
  };

  if (loading) return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Loading notifications...</div>;

  return (
    <div className="container" style={{ marginTop: '30px', maxWidth: '800px', paddingBottom: '50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>Your Notifications</h2>
        {notifications.length > 0 && (
          <button 
            onClick={handleClearHistory}
            style={{ background: 'white', color: '#dc3545', border: '1px solid #dc3545', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
             Clear All
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#777', fontSize: '16px' }}>You have no notifications right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notifications.map(notif => (
            <div 
              key={notif._id} 
              onClick={() => handleNotificationClick(notif)}
              style={{ 
                background: notif.isRead ? 'white' : '#f4faff',
                padding: '20px', 
                borderRadius: '8px', 
                borderLeft: notif.isRead ? '4px solid #ddd' : '4px solid #007bff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                cursor: notif.relatedOrderId ? 'pointer' : 'default',
                transition: 'transform 0.1s ease',
              }}
              onMouseEnter={(e) => notif.relatedOrderId && (e.currentTarget.style.transform = 'scale(1.01)')}
              onMouseLeave={(e) => notif.relatedOrderId && (e.currentTarget.style.transform = 'scale(1)')}
            >
              <p style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#333', fontWeight: notif.isRead ? 'normal' : 'bold' }}>
                {notif.message}
              </p>
              <span style={{ fontSize: '12px', color: '#777' }}>
                {new Date(notif.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}