import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import API from '../services/api';

export default function ChefOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today'); 
  
  const [otpModalData, setOtpModalData] = useState(null); 
  const [otpInput, setOtpInput] = useState('');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const highlightId = queryParams.get("highlight");
  const highlightedRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (highlightId && highlightedRef.current && !loading) {
      highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, highlightId]);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/chef');
      setOrders(data);
    } catch (error) {
      console.error("Error fetching incoming orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearPastHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your past orders? They will still be visible in your Earnings tab.")) return;
    try {
      await API.delete('/orders/chef/history/clear', { data: { today: new Date().toISOString() } });
      alert("Past history cleared.");
      fetchOrders();
    } catch (error) {
      alert("Failed to clear history.");
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
      const payload = { status: newStatus };
      if (otp) payload.otp = otp;
      await API.put(`/orders/${orderId}/status`, payload);
      setOrders(orders.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      if (newStatus === 'Delivered') setOtpModalData(null); 
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const extractAddress = (customer) => {
    if (!customer) return '';
    const addr = customer.address || customer.Address || {};
    const street = addr.street || addr.Street || addr.addressLine || '';
    const city = addr.city || addr.City || '';
    const pincode = addr.pincode || addr.Pincode || addr.zip || '';
    
    const parts = [street, city, pincode].filter(part => part && part.trim() !== '');
    return parts.length > 0 ? parts.join(', ') : '';
  };

  const openGoogleMaps = (customer) => {
    const lat = customer?.lat;
    const lng = customer?.lng;
    const fullText = extractAddress(customer);

    const mapUrl = (lat && lng) 
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullText)}`;
    
    if (mapUrl) window.open(mapUrl, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "orange";
      case "Preparing": return "#17a2b8";
      case "Out for Delivery": return "#007bff";
      case "Delivered": return "#28a745";
      case "Cancelled": return "#6c757d";
      default: return "gray";
    }
  };

  if (loading) return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Loading dashboard...</div>;

  const visibleOrders = orders.filter(o => o.chefVisible !== false);

  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const todayOrders = visibleOrders.filter(o => new Date(o.createdAt).setHours(0, 0, 0, 0) === startOfToday);
  const pastOrders = visibleOrders.filter(o => new Date(o.createdAt).setHours(0, 0, 0, 0) !== startOfToday);

  const renderOrderGrid = (orderList, isPastTab) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
      {orderList.map((order) => {
        const customer = order.CustomerId;
        const menu = order.post_MenuId;
        const isCOD = order.paymentId === 'COD'; 
        
        const fullAddressText = extractAddress(customer);
        const hasGPS = customer?.lat && customer?.lng;
        
        const isAbandoned = isPastTab && !['Delivered', 'Cancelled'].includes(order.status);
        const isCancelled = order.status === 'Cancelled';
        const isDimmed = isCancelled || isAbandoned;
        const isHighlighted = highlightId === order._id;

        return (
          <div 
            key={order._id} 
            ref={isHighlighted ? highlightedRef : null}
            className="card" 
            style={{ 
              borderTop: `4px solid ${getStatusColor(order.status)}`, 
              display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden',
              opacity: isDimmed ? 0.65 : 1, filter: isDimmed ? 'grayscale(80%)' : 'none',
              transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
              boxShadow: isHighlighted ? '0 0 15px rgba(0, 123, 255, 0.4)' : '0 4px 6px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDimmed ? '#e9ecef' : (isCOD ? '#fff3cd' : '#e8f5e9'), padding: '12px 15px', borderBottom: '1px solid #eaeaea' }}>
              <span style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>
                {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: isCancelled ? '#6c757d' : (isCOD ? '#856404' : '#28a745'), textTransform: 'uppercase' }}>
                {isAbandoned ? '⚠️ Expired' : (isCancelled ? '❌ Cancelled' : (isCOD ? '💵 Cash on Delivery' : '💳 Paid Online'))}
              </span>
            </div>

            <div style={{ padding: '15px', flexGrow: 1, pointerEvents: isDimmed ? 'none' : 'auto' }}>
              <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '12px', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                  {order.orderQuantity}x {menu?.MealTypes?.join(", ")}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#777', fontWeight: 'bold' }}>
                  Total: ₹{menu?.price * order.orderQuantity}
                </p>
              </div>

              <p style={{ margin: "0 0 5px 0", fontSize: '15px', fontWeight: 'bold', color: '#333' }}>{customer?.name}</p>
              <p style={{ margin: "0 0 10px 0", fontSize: '14px', color: '#007bff', fontWeight: 'bold' }}>📞 {customer?.PhoneNumber}</p>
              
              <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "6px", marginBottom: "15px", fontSize: "13px", color: "#555" }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: '#333' }}>Delivery Location:</strong>
                
                {fullAddressText ? (
                  <span style={{ lineHeight: '1.4', display: 'block', color: '#333', fontWeight: '500' }}>
                    📍 {fullAddressText}
                  </span>
                ) : hasGPS ? (
                  <span style={{ color: '#007bff', fontWeight: 'bold' }}>Tap map to view.</span>
                ) : (
                  <span style={{ color: '#dc3545', fontStyle: 'italic' }}>Address not provided by customer</span>
                )}
                
                <button 
                  onClick={() => openGoogleMaps(customer)} 
                  disabled={!fullAddressText && !hasGPS} 
                  style={{ display: 'block', width: '100%', marginTop: '10px', background: (!fullAddressText && !hasGPS) ? '#ccc' : '#007bff', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: (!fullAddressText && !hasGPS) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  Open in Google Maps
                </button>
              </div>
            </div>

            <div style={{ padding: '15px', borderTop: '1px solid #eaeaea', background: '#fafafa' }}>
              <select value={isAbandoned ? 'Cancelled' : (order.status || "Pending")} onChange={(e) => handleStatusChangeClick(order._id, e.target.value)} disabled={order.status === "Delivered" || isDimmed} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontWeight: "bold", background: (order.status === 'Delivered' || isDimmed) ? '#e9ecef' : 'white', cursor: (order.status === 'Delivered' || isDimmed) ? 'not-allowed' : 'pointer' }}>
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
  );

  return (
    <div className="container" style={{ maxWidth: '1000px', marginTop: '30px', paddingBottom: '50px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Incoming Orders Dashboard</h2>

      <div style={{ display: 'flex', borderBottom: '2px solid #eaeaea', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('today')} style={{ flex: 1, padding: '15px', background: 'transparent', border: 'none', borderBottom: activeTab === 'today' ? '3px solid #28a745' : '3px solid transparent', color: activeTab === 'today' ? '#28a745' : '#777', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
          🟢 Today's Orders ({todayOrders.length})
        </button>
        <button onClick={() => setActiveTab('past')} style={{ flex: 1, padding: '15px', background: 'transparent', border: 'none', borderBottom: activeTab === 'past' ? '3px solid #6c757d' : '3px solid transparent', color: activeTab === 'past' ? '#333' : '#777', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
          🗓️ Past Orders ({pastOrders.length})
        </button>
      </div>

      {activeTab === 'today' && (
        todayOrders.length === 0 ? <div style={{ background: 'white', padding: '60px 20px', textAlign: 'center', borderRadius: '12px' }}><h3 style={{ color: '#777' }}>No orders today.</h3></div> : renderOrderGrid(todayOrders, false)
      )}

      {activeTab === 'past' && (
        pastOrders.length === 0 ? <div style={{ background: 'white', padding: '60px 20px', textAlign: 'center', borderRadius: '12px' }}><h3 style={{ color: '#777' }}>No past orders.</h3></div> : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button onClick={handleClearPastHistory} style={{ background: 'white', color: '#dc3545', border: '1px solid #dc3545', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>🗑️ Clear Past History</button>
              </div>
              {renderOrderGrid(pastOrders, true)}
            </>
          )
      )}

      {otpModalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Complete Delivery</h3>
            <p style={{ margin: '0 0 20px 0', color: '#777', fontSize: '14px' }}>Ask the customer for the 4-digit Delivery PIN.</p>
            <input type="text" maxLength="4" value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: '15px', fontSize: '24px', letterSpacing: '8px', textAlign: 'center', borderRadius: '8px', border: '2px solid #007bff', outline: 'none', marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setOtpModalData(null)} style={{ flex: 1, padding: '12px', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#333' }}>Cancel</button>
              <button onClick={submitOTPAndDeliver} style={{ flex: 1, padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Verify</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}