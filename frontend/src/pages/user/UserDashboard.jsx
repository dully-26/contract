import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, Store, PlusCircle, Wallet } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const quickLinks = [
  {
    to: '/motorcycles',
    icon: Bike,
    title: 'Browse Contracts',
    description: 'Find available motorcycles for contract',
  },
  {
    to: '/marketplace',
    icon: Store,
    title: 'Marketplace',
    description: 'Buy motorcycles from verified sellers',
  },
  {
    to: '/sell',
    icon: PlusCircle,
    title: 'Sell Your Bike',
    description: 'List your motorcycle for sale',
  },
  {
    to: '/payments',
    icon: Wallet,
    title: 'My Payments',
    description: 'View contracts and make payments',
  },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/user/dashboard-stats').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <h1>Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>

      <div className="stats-grid" style={{ marginTop: 20 }}>
        <div className="stat-card">
          <p className="stat-value">{stats.active_contracts}</p>
          <p className="stat-label">Active Contracts</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">TZS {Number(stats.total_paid).toLocaleString()}</p>
          <p className="stat-label">Total Paid</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">TZS {Number(stats.total_outstanding).toLocaleString()}</p>
          <p className="stat-label">Outstanding Balance</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{stats.unread_notifications}</p>
          <p className="stat-label">Unread Notifications</p>
        </div>
      </div>

      {stats.next_due_contract && (
        <div className="alert-card">
          <strong>Upcoming Payment</strong>
          <p>
            {stats.next_due_contract.motorcycle.brand} {stats.next_due_contract.motorcycle.model} —
            {' '}TZS {Number(stats.next_due_contract.balance).toLocaleString()} remaining
          </p>
          <Link to="/payments" className="btn-small btn-approve" style={{ marginTop: 8, display: 'inline-block' }}>
            Make a Payment
          </Link>
        </div>
      )}

      <h2 style={{ marginTop: 30, marginBottom: 16, fontSize: 18 }}>Recently Listed Motorcycles</h2>
      <div className="card-grid">
        {stats.recent_listings.map((m) => (
          <div className="motorcycle-card" key={m.id}>
            <div className="card-image">
              {m.photos?.[0] ? (
                <img src={`http://localhost:8000/storage/${m.photos[0]}`} alt={m.model} />
              ) : <div className="no-image">No Image</div>}
            </div>
            <div className="card-body">
              <h3>{m.brand} {m.model}</h3>
              <p className="year">{m.year} • {m.condition}</p>
              <p className="total-price">TZS {Number(m.total_contract_price).toLocaleString()}</p>
              <Link to="/motorcycles" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-heading">Quick Actions</h2>
      <div className="tools-grid">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link to={link.to} className="tool-card" key={link.to}>
              <div className="tool-icon"><Icon size={22} /></div>
              <div>
                <h3>{link.title}</h3>
                <p>{link.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}