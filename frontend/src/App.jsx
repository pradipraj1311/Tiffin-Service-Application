import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MyOrders from "./pages/MyOrders";
import Subscriptions from "./pages/Subscriptions";
import Notifications from "./pages/Notifications";
import MenuHistory from './pages/MenuHistory';
import ChefOrders from "./pages/ChefOrders";
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Earnings from './pages/Earnings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['Chef', 'Customer']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/menu-history" element={
              <ProtectedRoute allowedRoles={['Chef']}>
                <MenuHistory />
              </ProtectedRoute>
            } />
            
            <Route path="/subscriptions" element={
              <ProtectedRoute allowedRoles={["Chef"]}>
                <Subscriptions />
              </ProtectedRoute>
            } />
            
            <Route path="/my-orders" element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <MyOrders />
              </ProtectedRoute>
            } />
            
            <Route path="/incoming-orders" element={
              <ProtectedRoute allowedRoles={['Chef']}>
                <ChefOrders />
              </ProtectedRoute>
            } />
            
            <Route path="/earnings" element={
              <ProtectedRoute allowedRoles={['Chef']}>
                <Earnings />
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute allowedRoles={['Chef', 'Customer']}>
                <Notifications />
              </ProtectedRoute>
            } />
   
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['Chef', 'Customer']}>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;