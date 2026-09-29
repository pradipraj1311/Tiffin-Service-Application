<<<<<<< Updated upstream
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
=======
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MyOrders from "./pages/MyOrders";
import Subscriptions from "./pages/Subscriptions";
import Notifications from "./pages/Notifications";
import MenuHistory from './pages/MenuHistory';
>>>>>>> Stashed changes

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
<<<<<<< Updated upstream
        <div style={{ padding: '20px' }}>
=======
        <div className="container">
>>>>>>> Stashed changes
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
<<<<<<< Updated upstream
            {/* Protect the dashboard route */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
=======
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/menu-history" element={
  <ProtectedRoute allowedRoles={['Chef']}>
    <MenuHistory />
  </ProtectedRoute>
} />
            
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute allowedRoles={["Chef"]}>
                  <Subscriptions />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute allowedRoles={["Customer"]}>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
>>>>>>> Stashed changes
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;