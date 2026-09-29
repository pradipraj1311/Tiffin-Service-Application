import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
<<<<<<< Updated upstream
import { getAllTiffins, createTiffin } from '../services/tiffinService';
=======
import API from '../services/api';
import { getAllTiffins, createTiffin, updateTiffin, deleteTiffin } from '../services/tiffinService';
import { createOrder } from '../services/orderService';
>>>>>>> Stashed changes

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tiffins, setTiffins] = useState([]);
  const [globalFoodItems, setGlobalFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
<<<<<<< Updated upstream
  // Chef Form State
  const [newMenu, setNewMenu] = useState({ MealTypes: 'Lunch', veg: true, MealNames: '' });
=======
  const today = new Date().toISOString().split('T')[0];
  
  const [menuForm, setMenuForm] = useState({ 
    MealTypes: 'Lunch', 
    veg: true,
    price: 150.00,
    deliveryDate: today,
    orderCutoff: '12:00',
    capacity: 10 
  });
  
  const [mealItems, setMealItems] = useState([]);
  const [itemInput, setItemInput] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [editingId, setEditingId] = useState(null); 
>>>>>>> Stashed changes

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tiffinData, itemsData] = await Promise.all([
        getAllTiffins(), 
        API.get('/tiffins/food-items')
      ]);
      setTiffins(tiffinData);
      setGlobalFoodItems(itemsData.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const activeTiffins = tiffins.filter(t => new Date(t.createdAt) >= sevenDaysAgo);

  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    
    if (mealItems.length === 0) {
      return alert("Validation Error: Please add at least one food item.");
    }
    if (menuForm.price <= 0) {
      return alert("Validation Error: Price must be greater than ₹0.");
    }
    if (menuForm.capacity < 1) {
      return alert("Validation Error: Daily Tiffins capacity must be at least 1.");
    }
    if (!menuForm.deliveryDate) {
      return alert("Validation Error: Please select a delivery date.");
    }

    try {
      const payload = {
        ...menuForm,
        MealTypes: [menuForm.MealTypes],
        MenuList: [{ veg: menuForm.veg, MealNames: mealItems }]
      };
<<<<<<< Updated upstream
      await createTiffin(payload);
      alert('Menu created successfully!');
      fetchTiffins(); // Refresh the list
=======
      
      if (editingId) {
        const updatedMenu = await updateTiffin(editingId, payload);
        setTiffins(tiffins.map(t => t._id === editingId ? updatedMenu : t));
        alert('Menu updated successfully!');
      } else {
        const newMenu = await createTiffin(payload);
        setTiffins([newMenu, ...tiffins]); 
        alert('Menu published successfully!');
      }
      
      setEditingId(null);
      setMealItems([]);
      setMenuForm({ ...menuForm, deliveryDate: today, price: 150.00 });
>>>>>>> Stashed changes
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };
<<<<<<< Updated upstream
=======

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
      const suggestions = globalFoodItems.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(suggestions);
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

  const removeMealItem = (itemToRemove) => {
    setMealItems(prev => prev.filter(item => item !== itemToRemove));
  };

  const handleOrder = async (menuId) => {
    try {
      await createOrder({ post_MenuId: menuId, orderQuantity: 1 });
      alert('Order placed successfully!');
    } catch (error) {
      alert('Failed to place order');
    }
  };
>>>>>>> Stashed changes

  if (loading) return <div>Loading...</div>;

  return (
<<<<<<< Updated upstream
    <div>
      <h2>Welcome to your Dashboard, {user.name}</h2>
      
      {/* CHEF VIEW: Form to add a new tiffin */}
      {user.role === 'Chef' && (
        <div style={{ background: '#f4f4f4', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
          <h3>Post a New Menu</h3>
          <form onSubmit={handleCreateMenu} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
            <select value={newMenu.MealTypes} onChange={(e) => setNewMenu({...newMenu, MealTypes: e.target.value})}>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
            <select value={newMenu.veg} onChange={(e) => setNewMenu({...newMenu, veg: e.target.value === 'true'})}>
              <option value="true">Vegetarian</option>
              <option value="false">Non-Vegetarian</option>
            </select>
            <input 
              type="text" 
              placeholder="Items (comma separated, e.g., Roti, Dal, Rice)" 
              value={newMenu.MealNames}
              onChange={(e) => setNewMenu({...newMenu, MealNames: e.target.value})}
              required
            />
            <button type="submit">Publish Menu</button>
=======
    <div className="container">
      
      {user.role === 'Chef' && (
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
                    {item} <strong style={{ cursor: 'pointer', color: '#ff6b6b' }} onClick={() => removeMealItem(item)}>×</strong>
                  </span>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Type food item " 
                  value={itemInput}
                  onChange={handleItemInputChange}
                  onKeyDown={handleKeyDown}
                  style={{ marginBottom: 0, border: 'none', background: 'transparent' }}
                />
                {filteredSuggestions.length > 0 && (
                  <ul style={{ position: 'absolute', background: 'white', border: '1px solid #ccc', width: '100%', listStyle: 'none', padding: 0, zIndex: 10 }}>
                    {filteredSuggestions.map(suggestion => (
                      <li key={suggestion.name} onClick={() => addMealItem(suggestion.name)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                        {suggestion.name}
                      </li>
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
                <input type="number" step="0.01" min="0" required value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} style={{ paddingLeft: '25px', marginBottom: 0, width: '85%' }} />
              </div>
              <div>
                <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>Delivery Date</label>
                <input type="date" required value={menuForm.deliveryDate} onChange={e => setMenuForm({...menuForm, deliveryDate: e.target.value})} style={{ marginBottom: 0, width: '85%' }} />
                <small style={{ color: '#007bff', display: 'block', marginTop: '5px' }}>
                  {formatDisplayDate(menuForm.deliveryDate)}
                </small>
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
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setMealItems([]); }} style={{ background: '#6c757d', flex: 1 }}>Cancel Edit</button>
              )}
            </div>
>>>>>>> Stashed changes
          </form>
        </div>
      )}

<<<<<<< Updated upstream
      {/* CUSTOMER & CHEF VIEW: List of available tiffins */}
      <h3>Available Tiffins</h3>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        {tiffins.length === 0 ? <p>No tiffins available right now.</p> : tiffins.map((tiffin) => (
          <div key={tiffin._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', minWidth: '200px' }}>
            <p><strong>Type:</strong> {tiffin.MealTypes.join(', ')}</p>
            {tiffin.MenuList.map((menu, index) => (
              <div key={index}>
                <p><strong>{menu.veg ? '🟢 Veg' : '🔴 Non-Veg'}</strong></p>
                <p>{menu.MealNames.join(', ')}</p>
              </div>
            ))}
            {user.role === 'Customer' && <button style={{ marginTop: '10px' }}>Order Now</button>}
          </div>
        ))}
=======
      <h3>{user.role === 'Chef' ? 'Active Menus (Last 7 Days)' : 'Today\'s Tiffin Options'}</h3>
      
      <div className="card-grid">
        {activeTiffins.length === 0 ? <p>No recent tiffins available.</p> : activeTiffins.map((tiffin) => {
          const ordersLeft = tiffin.capacity - (tiffin.soldOut ? tiffin.capacity : 0); 
          return (
            <div key={tiffin._id} className="card">

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{tiffin.MealTypes.join(', ')}</h4>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>₹{tiffin.price || 150}</span>
              </div>
              
              <p style={{ fontSize: '14px', color: '#007bff', fontWeight: 'bold' }}>
                {formatDisplayDate(tiffin.deliveryDate)}
              </p>
              
              {tiffin.MenuList.map((menu, index) => (
                <div key={index} style={{ margin: '10px 0' }}>
                  <p><strong>{menu.veg ? '🟢 Veg' : '🔴 Non-Veg'}</strong></p>
                  <p>{menu.MealNames.join(', ')}</p>
                </div>
              ))}
              
              <div style={{ background: '#fff3cd', color: '#856404', padding: '8px', borderRadius: '4px', fontSize: '12px', marginBottom: '10px' }}>
                <p>Order by: {tiffin.orderCutoff || '10:00 AM'}</p>
                {ordersLeft <= 5 ? (
                  <p><strong>Hurry! Only {ordersLeft} tiffins left.</strong></p>
                ) : (
                  <p>{ordersLeft} Tiffins remaining.</p>
                )}
              </div>

              {user.role === 'Customer' && (
                <button 
                  onClick={() => handleOrder(tiffin._id)} 
                  disabled={ordersLeft <= 0}
                  style={{ background: ordersLeft <= 0 ? 'gray' : '#28a745', width: '100%' }}
                >
                  {ordersLeft <= 0 ? 'Sold Out' : 'Order Now'}
                </button>
              )}

              {user.role === 'Chef' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => handleEdit(tiffin)} style={{ background: '#ffc107', color: 'black', flex: 1 }}>Edit</button>
                  <button onClick={() => handleDelete(tiffin._id)} style={{ background: '#dc3545', flex: 1 }}>Delete</button>
                </div>
              )}
            </div>
          );
        })}
>>>>>>> Stashed changes
      </div>
    </div>
  );
}