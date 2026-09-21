import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllTiffins, createTiffin } from '../services/tiffinService';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tiffins, setTiffins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newMenu, setNewMenu] = useState({ MealTypes: 'Lunch', veg: true, MealNames: '' });

  useEffect(() => {
    fetchTiffins();
  }, []);

  const fetchTiffins = async () => {
    try {
      const data = await getAllTiffins();
      setTiffins(data);
    } catch (error) {
      console.error("Error fetching tiffins", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        MealTypes: [newMenu.MealTypes],
        MenuList: [{ veg: newMenu.veg, MealNames: newMenu.MealNames.split(',').map(item => item.trim()) }]
      };
      await createTiffin(payload);
      alert('Menu created successfully!');
      fetchTiffins(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create menu');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome to your Dashboard, {user.name}</h2>
      
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
          </form>
        </div>
      )}

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
      </div>
    </div>
  );
}