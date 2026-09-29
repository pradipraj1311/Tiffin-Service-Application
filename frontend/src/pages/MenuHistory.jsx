import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllTiffins } from '../services/tiffinService';

export default function MenuHistory() {
  const { user } = useContext(AuthContext);
  const [pastTiffins, setPastTiffins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const allTiffins = await getAllTiffins();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const archived = allTiffins.filter(t => new Date(t.createdAt) < sevenDaysAgo);
      setPastTiffins(archived);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="container">
      <h2>Archived Menus</h2>
      <p>Menus posted more than 7 days ago appear here.</p>
      
      <div className="card-grid">
        {pastTiffins.length === 0 ? <p>No archived menus yet.</p> : pastTiffins.map((tiffin) => (
          <div key={tiffin._id} className="card" style={{ opacity: 0.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4>{tiffin.MealTypes.join(', ')}</h4>
              <span style={{ color: 'gray' }}>₹{tiffin.price || 150}</span>
            </div>
            <p style={{ fontSize: '14px', color: 'gray', fontWeight: 'bold' }}>
              {formatDisplayDate(tiffin.deliveryDate)}
            </p>
            {tiffin.MenuList.map((menu, index) => (
              <div key={index} style={{ margin: '10px 0' }}>
                <p><strong>{menu.veg ? '🟢 Veg' : '🔴 Non-Veg'}</strong></p>
                <p>{menu.MealNames.join(', ')}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}