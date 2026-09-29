import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTiffins } from '../services/tiffinService';
import { createOrder } from '../services/orderService';
import { createPayment } from '../services/paymentService';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [tiffins, setTiffins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState('Fetching location...');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus('');
      },
      (error) => {
        setLocationStatus('Location access denied. Showing all menus.');
        fetchData(null, null, searchQuery); 
      }
    );
  }, []);

  useEffect(() => {
    if (userLocation.lat) {
      fetchData(userLocation.lat, userLocation.lng, searchQuery);
    }
  }, [userLocation, searchQuery]);

  const fetchData = async (lat = null, lng = null, search = '') => {
    try {
      const data = await getAllTiffins({ lat, lng, search });
      setTiffins(data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInstantOrder = async (tiffin, method) => {
    try {
      const order = await createOrder({ post_MenuId: tiffin._id, orderQuantity: 1 });
      const dynamicPrice = tiffin.price * 1; 

      if (method === 'COD') {
        await createPayment({ order_Id: order._id, payment_type: 'COD', payment_status: false });
        alert('Order placed via Cash on Delivery! Redirecting...');
        navigate('/my-orders');
        return;
      }

      if (method === 'Online') {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) return alert('Razorpay SDK failed to load');

        const options = {
          key: 'rzp_test_YOUR_TEST_KEY_HERE', 
          amount: dynamicPrice * 100, 
          currency: 'INR',
          name: tiffin.CustomerId?.businessName || 'Tiffin Service',
          description: `Order for ${tiffin.MealTypes.join(', ')}`,
          handler: async function (response) {
            await createPayment({ order_Id: order._id, payment_type: 'Online Gateway', payment_status: true });
            alert(`Payment Successful! Redirecting...`);
            navigate('/my-orders');
          },
          theme: { color: '#28a745' },
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (error) {
      alert('Failed to process order or payment.');
    }
  };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeTiffins = tiffins.filter(t => {
    if (!t.createdAt) return true;
    return new Date(t.createdAt) >= sevenDaysAgo;
  });

  if (loading) return <div>Loading nearby tiffins...</div>;

  return (
    <div className="container">
      <div style={{ marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="🔍 Search for Tiffin Service Name (e.g., Umesh Tiffins) or Cuisine..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '15px', borderRadius: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        />
        {locationStatus && <small style={{ color: 'orange', display: 'block', marginTop: '10px', marginLeft: '15px' }}>{locationStatus}</small>}
      </div>

      <h3>Nearby Tiffin Options</h3>
      
      <div className="card-grid">
        {activeTiffins.length === 0 ? <p>No tiffins found in your area.</p> : activeTiffins.map((tiffin) => {
          const ordersLeft = tiffin.capacity - (tiffin.soldOut ? tiffin.capacity : 0); 
          const chef = tiffin.CustomerId; 

          return (
            <div key={tiffin._id} className="card">
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>{chef?.businessName || chef?.name || 'Tiffin Service'}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'gray' }}>📞 {chef?.PhoneNumber}</p>
                {typeof tiffin.calculatedDistance === 'number' && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#007bff', fontWeight: 'bold' }}>
                    📍 {tiffin.calculatedDistance.toFixed(1)} km away
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{tiffin.MealTypes.join(', ')}</h4>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>₹{tiffin.price || 150}</span>
              </div>
              
              <p style={{ fontSize: '14px', color: '#007bff', fontWeight: 'bold' }}>
                {tiffin.deliveryDate ? new Date(tiffin.deliveryDate).toLocaleDateString('en-GB') : 'N/A'}
              </p>
              
              {tiffin.MenuList.map((menu, index) => (
                <div key={index} style={{ margin: '10px 0' }}>
                  <p><strong>{menu.veg ? '🟢 Veg' : '🔴 Non-Veg'}</strong></p>
                  <p>{menu.MealNames.join(', ')}</p>
                </div>
              ))}
              
              <div style={{ background: '#fff3cd', color: '#856404', padding: '8px', borderRadius: '4px', fontSize: '12px', marginBottom: '10px' }}>
                <p>Order by: {tiffin.orderCutoff || '10:00 AM'}</p>
                {ordersLeft <= 5 ? <p><strong>Hurry! Only {ordersLeft} tiffins left.</strong></p> : <p>{ordersLeft} Tiffins remaining.</p>}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleInstantOrder(tiffin, 'Online')} disabled={ordersLeft <= 0} style={{ background: ordersLeft <= 0 ? 'gray' : '#28a745', flex: 1 }}>
                  {ordersLeft <= 0 ? 'Sold Out' : 'Pay Online'}
                </button>
                <button onClick={() => handleInstantOrder(tiffin, 'COD')} disabled={ordersLeft <= 0} style={{ background: ordersLeft <= 0 ? 'gray' : '#17a2b8', flex: 1 }}>
                  {ordersLeft <= 0 ? 'Sold Out' : 'COD'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}