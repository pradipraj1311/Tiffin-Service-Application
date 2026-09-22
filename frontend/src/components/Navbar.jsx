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
          <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>Welcome, {user.name} ({user.role})</span>
          <button onClick={logout} style={{ cursor: 'pointer' }}>Logout</button>
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
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        padding: "1rem",
        background: "#eee",
        display: "flex",
        gap: "15px",
      }}
    >
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </nav>
  );
}
