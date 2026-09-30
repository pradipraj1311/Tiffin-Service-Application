import { useEffect, useState } from 'react';
import { getPlans, subscribeToPlan } from '../services/subscriptionService';

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching subscription plans", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planName) => {
    try {
      await subscribeToPlan();
      alert(`Successfully subscribed to the ${planName}! Your Chef account is now active.`);
    } catch (error) {
      alert(error.response?.data?.message || 'Subscription failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Chef Subscription Plans</h2>
      <p>Select a tier to activate your account and start listing tiffins.</p>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{ 
            border: '2px solid #ccc', 
            padding: '20px', 
            borderRadius: '10px',
            minWidth: '250px',
            textAlign: 'center'
          }}>
            <h3>{plan.name}</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{plan.price}</p>
            <p style={{ color: 'gray' }}>Valid for {plan.duration}</p>
            <button 
              onClick={() => handleSubscribe(plan.name)} 
              style={{ background: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', marginTop: '10px' }}
            >
              Select {plan.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}