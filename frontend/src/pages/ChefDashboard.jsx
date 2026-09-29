import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { getAllTiffins, createTiffin, updateTiffin, deleteTiffin } from '../services/tiffinService';

export default function ChefDashboard() {
  const { user } = useContext(AuthContext);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Tiffins FIRST (Most important)
      const tiffinData = await getAllTiffins();
      setTiffins(tiffinData);
      
      // 2. Fetch Food Items SEPARATELY (If this fails, it won't break the menus)
      try {
        const itemsData = await API.get('/tiffins/food-items');
        setGlobalFoodItems(itemsData.data);
      } catch (itemErr) {
        console.error('Backend /food-items route crashed. Check your backend code!', itemErr);
        setGlobalFoodItems([]); // Fallback to empty array
      }
      
    } catch (error) {
      console.error('Error fetching tiffins', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMenu = async (e) => {
    e.preventDefault();
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
              <input type="text" placeholder="Type food item (Press Enter or , to add)" value={itemInput} onChange={handleItemInputChange} onKeyDown={handleKeyDown} style={{ marginBottom: 0, border: 'none', background: 'transparent' }} />
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
            <button type="button" onClick={() => setMenuForm({...menuForm, capacity: Math.max(1, menuForm.capacity - 1)})} style={{ background: '#ccc', width: '30px', padding: '5px' }}>-</button>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{menuForm.capacity}</span>
            <button type="button" onClick={() => setMenuForm({...menuForm, capacity: menuForm.capacity + 1})} style={{ background: '#ccc', width: '30px', padding: '5px' }}>+</button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1 }}>{editingId ? 'Update Menu' : 'Publish Menu'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setMealItems([]); }} style={{ background: '#6c757d', flex: 1 }}>Cancel Edit</button>}
          </div>
        </form>
      </div>
      {/* --- 🐞 DUMMY BUG CHECKER PANEL --- */}
      <div style={{ background: '#ffebee', padding: '15px', border: '2px solid red', margin: '20px 0', borderRadius: '8px' }}>
        <h4 style={{ color: 'red', marginTop: 0 }}>🐞 Diagnostic Bug Checker</h4>
        <p><strong>Your Chef ID:</strong> {user._id}</p>
        <p><strong>Total Tiffins Fetched from DB:</strong> {tiffins.length}</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: 'white' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '5px' }}>Menu ID</th>
              <th style={{ textAlign: 'left', padding: '5px' }}>Menu's Chef ID</th>
              <th style={{ textAlign: 'left', padding: '5px' }}>ID Match?</th>
              <th style={{ textAlign: 'left', padding: '5px' }}>Created Date</th>
              <th style={{ textAlign: 'left', padding: '5px' }}>7-Day Rule?</th>
            </tr>
          </thead>
          <tbody>
            {tiffins.map(t => {
              const rawChefId = typeof t.CustomerId === 'object' ? t.CustomerId?._id : t.CustomerId;
              const isChefMatch = String(rawChefId) === String(user._id);
              const isRecent = !t.createdAt || new Date(t.createdAt) >= sevenDaysAgo;

              return (
                <tr key={t._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '5px' }}>{t._id.substring(0, 6)}...</td>
                  <td style={{ padding: '5px' }}>{String(rawChefId)}</td>
                  <td style={{ padding: '5px', color: isChefMatch ? 'green' : 'red', fontWeight: 'bold' }}>
                    {isChefMatch ? 'YES' : 'NO'}
                  </td>
                  <td style={{ padding: '5px' }}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'MISSING'}</td>
                  <td style={{ padding: '5px', color: isRecent ? 'green' : 'red', fontWeight: 'bold' }}>
                    {isRecent ? 'YES' : 'NO'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* --- END BUG CHECKER --- */}

      <h3>Active Menus (Last 7 Days)</h3>
      <div className="card-grid">
        {activeTiffins.length === 0 ? <p>You have no active menus.</p> : activeTiffins.map((tiffin) => {
          const ordersLeft = tiffin.capacity - (tiffin.soldOut ? tiffin.capacity : 0); 
          return (
            <div key={tiffin._id} className="card">
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
                <button onClick={() => handleEdit(tiffin)} style={{ background: '#ffc107', color: 'black', flex: 1 }}>Edit</button>
                <button onClick={() => handleDelete(tiffin._id)} style={{ background: '#dc3545', flex: 1 }}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}