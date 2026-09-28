import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import MyOrders from './pages/MyOrders';
import Subscriptions from './pages/Subscriptions';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <div div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/subscriptions" element={
  <ProtectedRoute allowedRoles={['Chef']}>
    <Subscriptions />
  </ProtectedRoute>
} />
            <Route path="/my-orders" element={
  <ProtectedRoute allowedRoles={['Customer']}>
    <MyOrders />
  </ProtectedRoute>
} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;