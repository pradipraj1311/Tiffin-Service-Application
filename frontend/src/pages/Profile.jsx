import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function Profile() {
  const { user, refreshUser } = useContext(AuthContext);
  const [isLocating, setIsLocating] = useState(false);
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    PhoneNumber: '',
    altPhone: '',
    address: {
      street: '',
      city: '',
      pincode: '',
      full: ''
    },
    lat: null,
    lng: null,
    landmark: '',
    deliveryNotes: '',
    businessName: '',
    fssai: '',
    maxDeliveryRadius: 7, 
    dietaryPreference: 'All'
  });
  
  useEffect(() => {
    if (user && !isInitialized) {
      setFormData({
        name: user.name || '',
        PhoneNumber: user.PhoneNumber || '',
        altPhone: user.altPhone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          pincode: user.address?.pincode || '',
          full: user.address?.full || ''
        },
        lat: user.lat || null,
        lng: user.lng || null,
        landmark: user.landmark || '',
        deliveryNotes: user.deliveryNotes || '',
        businessName: user.businessName || '',
        fssai: user.fssai || '',
        maxDeliveryRadius: user.maxDeliveryRadius || 7, 
        dietaryPreference: user.dietaryPreference || 'All'
      });
      setIsInitialized(true); 
    }
  }, [user, isInitialized]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setFormData({
      ...formData,
      address: { ...formData.address, [e.target.name]: e.target.value }
    });
  };

  const isPending = user?.role === 'Chef' && user?.verificationStatus === 'Pending';

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      if (user.role === 'Customer') {
        delete payload.fssai;
        delete payload.businessName;
        delete payload.maxDeliveryRadius;
      }

      if (user.role === 'Chef' && !user.isProfileComplete && formData.fssai && formData.businessName) {
        payload.isProfileComplete = true;
        payload.verificationStatus = 'Pending';
      }

      await API.put('/users/profile', payload);
      await refreshUser(); 
      
      alert(user.role === 'Chef' && !user.isProfileComplete ? "Profile submitted! Awaiting Admin verification." : "Profile updated successfully!");
    } catch (error) {
      console.error("Profile Update Crash:", error.response || error);
      alert(`Error: ${error.response?.data?.message || 'Failed to connect to backend'}`);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser");
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        setFormData(prev => ({
          ...prev,
          lat: latitude,  
          lng: longitude,
          address: {
            ...prev.address,
            city: data.address?.city || data.address?.town || data.address?.county || prev.address.city,
            pincode: data.address?.postcode || prev.address.pincode,
            full: data.display_name || prev.address.full
          },
          landmark: data.address?.suburb || data.address?.neighbourhood || prev.landmark
        }));
      } catch (error) {
        alert("Failed to fetch address labels, but exact GPS coordinates were saved.");
        setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
      } finally {
        setIsLocating(false);
      }
    }, () => {
      alert("Location access denied. Please allow location permissions in your browser.");
      setIsLocating(false);
    }, { enableHighAccuracy: true });
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '30px' }}>
      <h2 style={{ marginBottom: '20px' }}>Account</h2>
      
      <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <p style={{ margin: 0 }}><strong>Email:</strong> {user.email}</p>
            {user.role === 'Chef' && <p style={{ margin: 0 }}><strong>Verification:</strong> {user.verificationStatus}</p>}
          </div>
        </div>

        {user.role === 'Customer' && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>Dietary Preferences</h4>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Show me menus that are:</label>
              <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="All">All (Veg & Non Veg)</option>
                <option value="Veg">Pure Veg 🟢</option>
                <option value="Non-Veg">Non Veg 🔴</option>
              </select>
            </div>
          </div>
        )}

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>Personal Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Full Name <span style={{color: 'red'}}>*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Primary Phone <span style={{color: 'red'}}>*</span></label>
              <input type="tel" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} required style={{ width: '100%', padding: '10px' }} />
            </div>
          </div>
        </div>

        {user.role === 'Chef' && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>Business & Compliance <span style={{color: 'red'}}>*</span></h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Tiffin Service / Kitchen Name</label>
                <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required style={{ width: '100%', padding: '10px' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>14-Digit FSSAI License Number</label>
                <input type="text" name="fssai" value={formData.fssai} onChange={handleChange} required minLength="14" maxLength="14" style={{ width: '100%', padding: '10px' }} />
              </div>
            </div>
          </div>
        )}

        {user.role === 'Chef' && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>Delivery Settings</h4>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                Maximum Delivery Distance (in km) <span style={{color: 'red'}}>*</span>
              </label>
              <input 
                type="number" 
                name="maxDeliveryRadius" 
                value={formData.maxDeliveryRadius} 
                onChange={handleChange} 
                min="1" 
                max="20" 
                required 
                style={{ width: '100%', padding: '10px' }} 
              />
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                Customers outside this distance will not be able to see or order your tiffin.
              </small>
            </div>
          </div>
        )}

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: 0 }}>{user.role === 'Chef' ? 'Kitchen Location' : 'Delivery Address'}</h4>
            <button type="button" onClick={handleGetLocation} disabled={isLocating} style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {isLocating ? ' Capturing ...' : '📍 Use your currrent Location'}
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Flat, House no., Building, Company, Apartment <span style={{color: 'red'}}>*</span></label>
              <input type="text" name="street" value={formData.address.street} onChange={handleAddressChange} required style={{ width: '100%', padding: '10px' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>City / Town <span style={{color: 'red'}}>*</span></label>
                <input type="text" name="city" value={formData.address.city} onChange={handleAddressChange} required style={{ width: '100%', padding: '10px' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Pincode <span style={{color: 'red'}}>*</span></label>
                <input type="text" name="pincode" value={formData.address.pincode} onChange={handleAddressChange} required style={{ width: '100%', padding: '10px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Landmark (e.g., Near Apollo Hospital)</label>
                <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} style={{ width: '100%', padding: '10px' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Alternate Phone (Optional)</label>
                <input type="number" name="altPhone" value={formData.altPhone} onChange={handleChange} style={{ width: '100%', padding: '10px' }} />
              </div>
            </div>

            {user.role === 'Customer' && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Delivery Instructions (Optional)</label>
                <textarea name="deliveryNotes" placeholder="e.g., Leave at security desk, Do not ring bell" value={formData.deliveryNotes} onChange={handleChange} rows="2" style={{ width: '100%', padding: '10px' }}></textarea>
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          style={{ 
            background: isPending ? '#6c757d' : '#28a745', 
            color: 'white', 
            padding: '15px', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            cursor: isPending ? 'not-allowed' : 'pointer' 
          }}
        >
          {isPending 
            ? '⏳ Awaiting Admin Approval (Profile Locked)' 
            : (user.role === 'Chef' && !user.isProfileComplete ? 'Submit Profile for Review' : 'Save Profile Changes')
          }
        </button>
      </form>
    </div>
  );
}