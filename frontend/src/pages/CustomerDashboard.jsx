import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tiffins, setTiffins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressMissing, setAddressMissing] = useState(false);
  
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [displayLocationName, setDisplayLocationName] = useState(user?.address?.city || 'Select Area ');
  const [activeSearchCoords, setActiveSearchCoords] = useState(null);
  
  const [notifyStatus, setNotifyStatus] = useState('Notify Me When Kitchens Open Here');

  useEffect(() => {
    fetchNearbyTiffins();
  }, []);

  const fetchNearbyTiffins = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/tiffins/nearby');
      setTiffins(data);
      setAddressMissing(false);
    } catch (error) {
      if (error.response?.data?.code === 'GPS_MISSING') {
        setAddressMissing(true);
      } else {
        console.error("Failed to load menus", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (inputValue.trim().length > 2) {
        setIsSearchingLocation(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&countrycodes=in&limit=5`);
          const data = await res.json();
          setSuggestions(data);
        } catch (error) {
          console.error("Location search failed", error);
        } finally {
          setIsSearchingLocation(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 600);

    return () => clearTimeout(delaySearch);
  }, [inputValue]);

  const handleSelectLocation = async (loc) => {
    const shortName = loc.display_name.split(',')[0]; 
    setInputValue(''); 
    setDisplayLocationName(shortName);
    setSuggestions([]);
    setLoading(true);
    setNotifyStatus('Notify Me When Kitchens Open Here'); 
    
    setActiveSearchCoords({ lat: loc.lat, lng: loc.lon });
    
    try {
      const { data } = await API.get(`/tiffins/nearby?customLat=${loc.lat}&customLng=${loc.lon}`);
      setTiffins(data);
      setAddressMissing(false);
    } catch (error) {
      alert("Oops! We couldn't load menus for this area right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyMe = async () => {
    const latToSave = activeSearchCoords ? activeSearchCoords.lat : user?.lat;
    const lngToSave = activeSearchCoords ? activeSearchCoords.lng : user?.lng;

    if (!latToSave || !lngToSave) return alert("Location data is missing. Please search an area or set your GPS.");

    try {
      setNotifyStatus('Saving...');
      await API.post('/users/waitlist', {
        locationName: displayLocationName,
        lat: latToSave,
        lng: lngToSave
      });
      setNotifyStatus('We will email you.');
    } catch (error) {
      if (error.response?.status === 400) {
        setNotifyStatus(' You are already on the list for this area.');
      } else {
        setNotifyStatus('Notify Me When Kitchens Open Here');
        alert("Failed to join waitlist. Please try again.");
      }
    }
  };

  if (loading) return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Looking for great food near you...</div>;

  if (addressMissing && tiffins.length === 0) {
    return (
      <div className="container" style={{ maxWidth: '600px', marginTop: '50px', textAlign: 'center' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>📍 Delivery Location Needed</h2>
          <p style={{ color: '#555', fontSize: '16px', marginBottom: '25px', lineHeight: '1.6' }}>
            To show you the best home-cooked meals, we need to know where to deliver.
          </p>
          <button onClick={() => navigate('/profile')} style={{ background: '#007bff', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%', marginBottom: '15px' }}>
            Set My Permanent Address
          </button>
          
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text" 
              placeholder="Or search for a city or area..." 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }} 
            />
            {isSearchingLocation && <div style={{ position: 'absolute', right: '10px', top: '12px', fontSize: '12px', color: '#888' }}>Searching...</div>}
            
            {suggestions.length > 0 && (
              <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', borderRadius: '0 0 6px 6px', listStyle: 'none', padding: 0, margin: 0, zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'left' }}>
                {suggestions.map((loc) => (
                  <li 
                    key={loc.place_id} 
                    onClick={() => handleSelectLocation(loc)} 
                    style={{ padding: '12px 15px', borderBottom: '1px solid #eee', cursor: 'pointer', fontSize: '14px', color: '#333' }}
                  >
                    {loc.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      
      <div style={{ background: 'white', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>📍</span>
          <div>
            <p style={{ margin: 0, fontSize: '11px', color: '#777', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivering To</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              {displayLocationName}
            </p>
          </div>
        </div>
        
        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search a different area..." 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' }} 
          />
          {isSearchingLocation && <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '12px', color: '#999' }}>Searching...</span>}
          
          {suggestions.length > 0 && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', borderRadius: '4px', listStyle: 'none', padding: 0, margin: '5px 0 0 0', zIndex: 100, maxHeight: '250px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              {suggestions.map((loc) => (
                <li 
                  key={loc.place_id} 
                  onClick={() => handleSelectLocation(loc)} 
                  style={{ padding: '12px 15px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', fontSize: '13px', color: '#444', lineHeight: '1.4' }}
                >
                  <strong style={{ display: 'block', color: '#000', marginBottom: '2px' }}>{loc.display_name.split(',')[0]}</strong>
                  {loc.display_name.split(',').slice(1).join(', ')}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Nearby Tiffins</h2>
        <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
          {tiffins.length} Menus Found
        </span>
      </div>
      
      {tiffins.length === 0 ? (
        <div style={{ background: 'white', padding: '50px 20px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: '4px solid #ffc107' }}>
          <h3 style={{ color: '#856404', margin: '0 0 15px 0' }}>No kitchens found in this area </h3>
          <p style={{ color: '#555', fontSize: '16px', maxWidth: '400px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
            We are expanding fast, but there are no chefs delivering to this specific location right now.
          </p>
          <button 
            onClick={handleNotifyMe}
            disabled={notifyStatus.includes('Saved') || notifyStatus.includes('already')}
            style={{ 
              background: notifyStatus.includes('Saved') || notifyStatus.includes('already') ? '#e8f5e9' : '#28a745', 
              color: notifyStatus.includes('Saved') || notifyStatus.includes('already') ? '#28a745' : 'white', 
              padding: '15px 30px', 
              border: notifyStatus.includes('Saved') || notifyStatus.includes('already') ? '1px solid #28a745' : 'none', 
              borderRadius: '6px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: notifyStatus.includes('Saved') || notifyStatus.includes('already') ? 'not-allowed' : 'pointer', 
              transition: 'all 0.3s' 
            }}
          >
            {notifyStatus}
          </button>
        </div>
      ) : (
        <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {tiffins.map((tiffin) => (
            <div key={tiffin._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{tiffin.CustomerId?.businessName || 'Local Kitchen'}</h4>
                  <span style={{ fontSize: '12px', background: '#f8f9fa', padding: '3px 8px', borderRadius: '4px', border: '1px solid #ddd' }}>
                    📍 {tiffin.distance} km away
                  </span>
                </div>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>₹{tiffin.price}</span>
              </div>

              <div style={{ margin: '15px 0', flexGrow: 1 }}>
                <p style={{ fontSize: '14px', color: '#007bff', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                  Delivery: {new Date(tiffin.deliveryDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
                {tiffin.MenuList.map((menu, idx) => (
                  <div key={idx} style={{ marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: menu.veg ? '#28a745' : '#dc3545' }}>
                      {menu.veg ? '🟢 VEG' : '🔴 NON-VEG'} • {tiffin.MealTypes.join(', ')}
                    </span>
                    <p style={{ margin: '5px 0 0 0', fontSize: '15px', color: '#444' }}>
                      {menu.MealNames.join(', ')}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '4px', fontSize: '12px', marginBottom: '15px' }}>
                Order before {tiffin.orderCutoff}
              </div>

              <button 
                onClick={() => alert('Razorpay Checkout Flow coming next!')}
                style={{ background: '#28a745', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', width: '100%', fontWeight: 'bold', cursor: 'pointer', marginTop: 'auto' }}
              >
                Order Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}