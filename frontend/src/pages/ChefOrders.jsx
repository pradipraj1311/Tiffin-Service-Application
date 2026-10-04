import { useEffect, useState } from "react";
import { getChefOrders, updateOrderStatus } from "../services/orderService";

export default function ChefOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [otpModalData, setOtpModalData] = useState(null); 
  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getChefOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching incoming orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeClick = (orderId, newStatus) => {
    if (newStatus === "Delivered") {
      setOtpModalData(orderId);
      setOtpInput('');
      return;
    }
    processStatusUpdate(orderId, newStatus);
  };

  const submitOTPAndDeliver = async () => {
    if (otpInput.length !== 4) return alert("OTP must be exactly 4 digits.");
    processStatusUpdate(otpModalData, 'Delivered', otpInput);
  };

  const processStatusUpdate = async (orderId, newStatus, otp = null) => {
    try {
      await updateOrderStatus(orderId, newStatus, otp);

      setOrders(orders.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      
      if (newStatus === 'Delivered') {
        alert("Success! Order marked as Delivered.");
        setOtpModalData(null); 
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const openGoogleMaps = (customer) => {
    const lat = customer.lat;
    const lng = customer.lng;
    const addressString = `${customer?.address?.street || ''}, ${customer?.address?.city || ''} ${customer?.address?.pincode || ''}`;
    
    const mapUrl = (lat && lng) 
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressString)}`;
      
    window.open(mapUrl, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "orange";
      case "Preparing": return "#17a2b8";
      case "Out for Delivery": return "#007bff";
      case "Delivered": return "#28a745";
      case "Cancelled": return "red";
      default: return "gray";
    }
  };

  if (loading) return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Loading orders...</div>;

  return (
    <div className="container" style={{ maxWidth: '1000px', marginTop: '30px', paddingBottom: '50px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Incoming Orders Dashboard</h2>

      {orders.length === 0 ? (
        <div style={{ background: 'white', padding: '60px 20px', textAlign: 'center', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#777' }}>No incoming orders yet.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {orders.map((order) => {
            const customer = order.CustomerId;
            const menu = order.post_MenuId;
            const isCOD = order.paymentId === 'COD';
            
            return (
              <div key={order._id} className="card" style={{ borderTop: `4px solid ${getStatusColor(order.status)}`, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isCOD ? '#fff3cd' : '#e8f5e9', padding: '12px 15px', borderBottom: '1px solid #eaeaea' }}>
                  <span style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>
                    {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: isCOD ? '#856404' : '#28a745', textTransform: 'uppercase' }}>
                    {isCOD ? '💵 Cash on Delivery' : '💳 Paid Online'}
                  </span>
                </div>

                <div style={{ padding: '15px', flexGrow: 1 }}>
                  <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '12px', marginBottom: '12px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                      {order.orderQuantity}x {menu?.MealTypes?.join(", ")} Tiffin
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#777', fontWeight: 'bold' }}>
                      Collect: ₹{menu?.price * order.orderQuantity}
                    </p>
                  </div>

                  <p style={{ margin: "0 0 5px 0", fontSize: '15px', fontWeight: 'bold', color: '#333' }}>{customer?.name}</p>
                  <p style={{ margin: "0 0 10px 0", fontSize: '14px', color: '#007bff', fontWeight: 'bold' }}>📞 {customer?.PhoneNumber}</p>
                  
                  <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "6px", marginBottom: "15px", fontSize: "13px", color: "#555" }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: '#333' }}>Delivery Address:</strong>
                    {customer?.address?.street}, {customer?.address?.city} {customer?.address?.pincode}
                    
                    <button 
                      onClick={() => openGoogleMaps(customer)}
                      style={{ display: 'block', width: '100%', marginTop: '10px', background: '#007bff', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                       see location
                    </button>
                  </div>
                </div>

                <div style={{ padding: '15px', borderTop: '1px solid #eaeaea', background: '#fafafa' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '5px' }}>Update Status:</label>
                  <select
                    value={order.status || "Pending"}
                    onChange={(e) => handleStatusChangeClick(order._id, e.target.value)}
                    disabled={order.status === "Delivered" || order.status === "Cancelled"}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontWeight: "bold", background: (order.status === 'Delivered' || order.status === 'Cancelled') ? '#e9ecef' : 'white' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Mark as Delivered (Requires OTP)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {otpModalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Complete Delivery</h3>
            <p style={{ margin: '0 0 20px 0', color: '#777', fontSize: '14px' }}>Ask the customer for the 4-digit Delivery PIN shown on their "My Orders" page.</p>
            
            <input 
              type="text" 
              placeholder="Enter 4-Digit PIN" 
              maxLength="4"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              style={{ width: '100%', padding: '15px', fontSize: '24px', letterSpacing: '8px', textAlign: 'center', borderRadius: '8px', border: '2px solid #007bff', outline: 'none', marginBottom: '20px' }}
            />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setOtpModalData(null)} style={{ flex: 1, padding: '12px', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#333' }}>
                Cancel
              </button>
              <button onClick={submitOTPAndDeliver} style={{ flex: 1, padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Verify & Deliver
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}