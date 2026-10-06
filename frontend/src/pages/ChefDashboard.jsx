import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { getAllTiffins, createTiffin, updateTiffin, deleteTiffin } from '../services/tiffinService';

export default function ChefDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [tiffins, setTiffins] = useState([]);
  const [globalFoodItems, setGlobalFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const [menuForm, setMenuForm] = useState({ 
    MealTypes: 'Lunch', veg: true, price: 150.00, deliveryDate: today, orderCutoff: '12:00', capacity: 10 
  });
  const [mealItems, setMealItems] = useState([]);
  const [itemInput, setItemInput] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [editingId, setEditingId] = useState(null); 

  const isWorkspaceLocked = !user.isProfileComplete || user.verificationStatus !== 'Approved' || !user.isSubscribed;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const tiffinData = await getAllTiffins();
      setTiffins(tiffinData);
      
      try {
        const itemsData = await API.get('/tiffins/food-items');
        setGlobalFoodItems(itemsData.data);
      } catch (itemErr) {
        console.error('Backend /food-items route crashed', itemErr);
        setGlobalFoodItems([]); 
      }
    } catch (error) {
      console.error('Error fetching tiffins', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSubscribe = async () => {
    try {
      await API.post('/subscriptions/activate');
      alert('₹1999 Premium Subscription activated successfully!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Subscription failed');
    }
  };


  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    if (isWorkspaceLocked) return alert("Action blocked: Workspace is locked.");
    if (mealItems.length === 0) return alert("Please add at least one food item.");
    if (menuForm.price <= 0) return alert("Price must be greater than ₹0.");
    if (menuForm.capacity < 1) return alert("Daily Tiffins capacity must be at least 1.");
    if (!menuForm.deliveryDate) return alert("Please select a delivery date.");

    try {
      const payload = {
        ...menuForm,
        MealTypes: [menuForm.MealTypes],
        MenuList: [{ veg: menuForm.veg, MealNames: mealItems }]
      };
      
      if (editingId) {
        await updateTiffin(editingId, payload);
        alert('Menu updated successfully!');
      } else {
        await createTiffin(payload);
        alert('Menu published successfully!');
      }
      
      fetchData(); 
      setEditingId(null);
      setMealItems([]);
      setMenuForm({ ...menuForm, deliveryDate: today, price: 150.00 });
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };


  const handleEdit = (tiffin) => {
    if (isWorkspaceLocked) return alert("Action blocked: Workspace is locked.");
    setEditingId(tiffin._id);
    setMenuForm({
      MealTypes: tiffin.MealTypes[0],
      veg: tiffin.MenuList[0].veg,
      price: tiffin.price,
      deliveryDate: tiffin.deliveryDate ? tiffin.deliveryDate.split('T')[0] : today,
      orderCutoff: tiffin.orderCutoff,
      capacity: tiffin.capacity
    });
    setMealItems(tiffin.MenuList[0].MealNames);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleDelete = async (id) => {
    if (isWorkspaceLocked) return alert("Action blocked: Workspace is locked.");
    if (!window.confirm("Are you sure you want to delete this menu?")) return;
    try {
      await deleteTiffin(id);
      setTiffins(tiffins.filter(t => t._id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };


  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: '2-digit' });
  };



  const handleItemInputChange = (e) => {
    const value = e.target.value;
    setItemInput(value);
    if (value) {
      setFilteredSuggestions(globalFoodItems.filter(item => item.name.toLowerCase().includes(value.toLowerCase())));
    } else {
      setFilteredSuggestions([]);
    } 
  };

  const addMealItem = (itemToAdd) => {
    const cleanItem = itemToAdd.trim();
    if (cleanItem && !mealItems.includes(cleanItem)) {
      setMealItems(prev => [...prev, cleanItem]);
    }
    setItemInput('');
    setFilteredSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addMealItem(itemInput);
    }
  };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const activeTiffins = tiffins.filter(t => {
    if (!t.createdAt) return true; 
    return new Date(t.createdAt) >= sevenDaysAgo;
  }).filter(t => {
    const menuChefId = typeof t.CustomerId === 'object' ? t.CustomerId?._id : t.CustomerId;
    return String(menuChefId) === String(user._id);
  });

  if (loading) return <div>Loading...</div>;

  
  return (
    <div className="container">
      
      {isWorkspaceLocked ? (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto 40px auto', padding: '30px' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>🔒 Workspace Locked: Complete Onboarding</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '30px 0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '4px', background: '#eee', zIndex: 1 }}></div>
            
            <div style={{ zIndex: 2, background: 'white', padding: '0 10px', textAlign: 'center' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: user.isProfileComplete ? '#28a745' : '#007bff', color: 'white', lineHeight: '30px', margin: '0 auto' }}>1</div>
              <small>Complete Profile</small>
            </div>
            
            <div style={{ zIndex: 2, background: 'white', padding: '0 10px', textAlign: 'center' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: user.verificationStatus === 'Approved' ? '#28a745' : (user.verificationStatus === 'Pending' ? '#ffc107' : '#eee'), color: user.verificationStatus === 'Incomplete' ? 'gray' : 'white', lineHeight: '30px', margin: '0 auto' }}>2</div>
              <small>Admin Verification</small>
            </div>

            <div style={{ zIndex: 2, background: 'white', padding: '0 10px', textAlign: 'center' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: user.isSubscribed ? '#28a745' : '#eee', color: user.isSubscribed ? 'white' : 'gray', lineHeight: '30px', margin: '0 auto' }}>3</div>
              <small>Subscription</small>
            </div>
          </div>

          {!user.isProfileComplete && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <h4>Step 1: Required Details Missing</h4>
              <p>You must provide your Business Name and FSSAI license in your profile</p>
              <button onClick={() => navigate('/profile')} style={{ background: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Continue </button>
            </div>
          )}

          {user.isProfileComplete && user.verificationStatus === 'Pending' && (
            <div style={{ textAlign: 'center', padding: '20px', background: '#fff3cd', color: '#856404', borderRadius: '6px' }}>
              <h4>⏳ Awaiting Admin Verification</h4>
              <p>We are verifying your FSSAI license. This usually takes 24 hours.</p>
            </div>
          )}

          {user.verificationStatus === 'Rejected' && (
            <div style={{ textAlign: 'center', padding: '20px', background: '#f8d7da', color: '#721c24', borderRadius: '6px' }}>
              <h4>❌ Verification Failed</h4>
              <p>Your FSSAI or details were invalid. Please check your profile settings or contact support.</p>
            </div>
          )}

          {user.verificationStatus === 'Approved' && !user.isSubscribed && (
            <div style={{ textAlign: 'center', padding: '20px', background: '#d4edda', color: '#155724', borderRadius: '6px' }}>
              <h4>✅ Verified! Action Required</h4>
              <button onClick={() => navigate('/subscriptions')} style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
                Activate Premium (₹1999/mo)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto 40px auto' }}>
          <h3>{editingId ? 'Edit Menu' : 'Create Menu'}</h3>
          <form onSubmit={handleSubmitMenu} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={menuForm.MealTypes} onChange={e => setMenuForm({...menuForm, MealTypes: e.target.value})}>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Breakfast">Breakfast</option>
              </select>
              <select value={menuForm.veg} onChange={e => setMenuForm({...menuForm, veg: e.target.value === 'true'})}>
                <option value="true">🟢 Vegetarian</option>
                <option value="false">🔴 Non-Vegetarian</option>
              </select>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                {mealItems.map(item => (
                  <span key={item} style={{ background: '#e9ecef', padding: '5px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
                    {item} <strong style={{ cursor: 'pointer', color: '#ff6b6b' }} onClick={() => setMealItems(prev => prev.filter(i => i !== item))}>×</strong>
                  </span>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Type food item" value={itemInput} onChange={handleItemInputChange} onKeyDown={handleKeyDown} style={{ marginBottom: 0, border: 'none', background: 'transparent', width: '100%' }} />
                {filteredSuggestions.length > 0 && (
                  <ul style={{ position: 'absolute', background: 'white', border: '1px solid #ccc', width: '100%', listStyle: 'none', padding: 0, zIndex: 10 }}>
                    {filteredSuggestions.map(suggestion => (
                      <li key={suggestion.name} onClick={() => addMealItem(suggestion.name)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>{suggestion.name}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="button" onClick={() => addMealItem(itemInput)} style={{ background: '#eee', color: '#333', marginTop: '10px' }}>+ Add Item</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'start' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>Price per Tiffin</label>
                <span style={{ position: 'absolute', left: '10px', top: '35px', fontWeight: 'bold' }}>₹</span>
                <input type="number" step="0.01" min="0" required value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} style={{ paddingLeft: '25px', marginBottom: 0, width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>Delivery Date</label>
                <input type="date" required value={menuForm.deliveryDate} onChange={e => setMenuForm({...menuForm, deliveryDate: e.target.value})} style={{ marginBottom: 0, width: '100%' }} />
                <small style={{ color: '#007bff', display: 'block', marginTop: '5px' }}>{formatDisplayDate(menuForm.deliveryDate)}</small>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ fontSize: '14px' }}>Accepting orders until:</label>
              <input type="time" required value={menuForm.orderCutoff} onChange={e => setMenuForm({...menuForm, orderCutoff: e.target.value})} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
              <span style={{ fontWeight: 'bold' }}>Daily Tiffins:</span>
              <button type="button" onClick={() => setMenuForm({...menuForm, capacity: Math.max(1, menuForm.capacity - 1)})} style={{ background: '#ccc', width: '30px', padding: '5px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>-</button>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{menuForm.capacity}</span>
              <button type="button" onClick={() => setMenuForm({...menuForm, capacity: menuForm.capacity + 1})} style={{ background: '#ccc', width: '30px', padding: '5px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {editingId ? 'Update Menu' : 'Publish Menu'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setMealItems([]); }} style={{ background: '#6c757d', color: 'white', flex: 1, padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <h3>Active Menus (Last 7 Days)</h3>
      <div className="card-grid">
        {activeTiffins.length === 0 ? <p>You have no active menus.</p> : activeTiffins.map((tiffin) => {
          const ordersLeft = tiffin.capacity - (tiffin.soldOut ? tiffin.capacity : 0); 
          return (
            <div key={tiffin._id} className="card" style={{ opacity: isWorkspaceLocked ? 0.6 : 1 }}>
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
                <p>{ordersLeft} Tiffins remaining.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => handleEdit(tiffin)} style={{ background: '#ffc107', color: 'black', flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(tiffin._id)} style={{ background: '#dc3545', color: 'white', flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}