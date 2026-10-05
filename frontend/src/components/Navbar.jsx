import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const { data } = await API.get('/notifications');
          const unread = data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        } catch (error) {
          console.error("Failed to fetch notification count", error);
        }
      };

      fetchUnreadCount();
      
      const interval = setInterval(fetchUnreadCount, 30000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <nav
      style={{
        padding: "1rem",
        background: "#eee",
        display: "flex",
        gap: "15px",
        alignItems: "center",
      }}
    >

      {user ? (
        <>
          {user.role === 'Admin' && <Link to="/admin-dashboard" style={{ color: '#ffc107', fontWeight: 'bold', textDecoration: 'none' }}>Admin Panel</Link>}
          <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333' }}>Dashboard</Link>
          {user.role === "Chef" && <Link to="/menu-history" style={{ textDecoration: 'none', color: '#333' }}>Menu History</Link>}
          {user.role === "Chef" && <Link to="/incoming-orders" style={{ textDecoration: 'none', color: '#333' }}>Incoming Orders</Link>}
          {user.role === "Chef" && <Link to="/earnings" style={{ textDecoration: 'none', color: '#333' }}>Earnings</Link>} 
          {user.role === "Chef" && <Link to="/subscriptions" style={{ textDecoration: 'none', color: '#333' }}>Subscriptions</Link>}
          {user.role === "Customer" && <Link to="/my-orders" style={{ textDecoration: 'none', color: '#333' }}>My Orders</Link>}
          <Link to="/profile" style={{ textDecoration: 'none', color: '#333' }}>Profile</Link>

          <span style={{ marginLeft: "auto", fontWeight: "bold" }}>
          </span>
          
          <Link to="/notifications" style={{ position: 'relative', display: 'inline-block', marginRight: '15px', textDecoration: 'none', color: '#333' }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '-18px',
                background: '#e23744',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <button 
            onClick={logout} 
            style={{ cursor: "pointer", background: '#e23744', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', fontWeight: 'bold' }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginLeft: "auto", textDecoration: 'none', color: '#333' }}>
            Login
          </Link>
          <Link to="/register" style={{ textDecoration: 'none', color: '#333' }}>
            Register
          </Link>
        </>
      )}
    </nav>
  );
}