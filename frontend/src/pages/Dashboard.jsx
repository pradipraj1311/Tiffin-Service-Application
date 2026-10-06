import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ChefDashboard from './ChefDashboard';
import CustomerDashboard from './CustomerDashboard';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (!user) return <div>Loading...</div>;

  return user.role === 'Chef' ? <ChefDashboard /> : <CustomerDashboard />;
}
