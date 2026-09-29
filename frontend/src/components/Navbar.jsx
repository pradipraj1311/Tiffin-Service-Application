import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{ padding: '1rem', background: '#eee', display: 'flex', gap: '15px', alignItems: 'center' }}>
      <Link to="/">Home</Link>
      
      {user ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
<<<<<<< Updated upstream
          <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>Welcome, {user.name} ({user.role})</span>
          <button onClick={logout} style={{ cursor: 'pointer' }}>Logout</button>
=======
          {user.role === 'Chef' && <Link to="/menu-history">Menu History</Link>}
          {user.role === "Customer" && <Link to="/my-orders">My Orders</Link>}
          {user.role === "Chef" && (
            <Link to="/subscriptions">Subscriptions</Link>
          )}
          <span style={{ marginLeft: "auto", fontWeight: "bold" }}>
            {/* Welcome {user.name}  */}
          </span>
          <Link to="/notifications">Notifications</Link>

          <button onClick={logout} style={{ cursor: "pointer" }}>
            Logout
          </button>
>>>>>>> Stashed changes
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginLeft: 'auto' }}>Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}