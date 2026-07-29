import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { Users, UserPlus, ScrollText, FileBarChart, Bike, Store } from 'lucide-react';
import api from '../../api/axios';

const COLORS = ['#16A34A', '#F59E0B', '#DC2626', '#64748B', '#1E3A8A'];

const adminTools = [
  {
    to: '/admin/motorcycles',
    icon: Bike,
    title: 'Motorcycles',
    description: 'Add, edit, and manage all listed motorcycles',
  },
  {
    to: '/admin/users',
    icon: Users,
    title: 'Manage Users',
    description: 'View, activate, deactivate customer accounts',
  },
  {
    to: '/admin/add-manager',
    icon: UserPlus,
    title: 'Add Manager',
    description: 'Create a new manager account with access',
  },
  {
    to: '/admin/audit-logs',
    icon: ScrollText,
    title: 'Activity Logs',
    description: 'Track every action performed in the system',
  },
  {
    to: '/manager/reports',
    icon: FileBarChart,
    title: 'Reports',
    description: 'Generate payment, contract, and sales reports',
  },
  {
    to: '/manager',
    icon: Store,
    title: 'Contract Requests',
    description: 'Review and approve pending contract requests',
  },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api.get('/dashboard/overview')
      .then((res) => {
        if (isMounted) setData(res.data);
      })
      .catch((err) => {
        if (isMounted) setError(err.response?.data?.message || 'Failed to load dashboard data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="dashboard-skeleton">
          <div className="skeleton-stats">
            {[...Array(6)].map((_, i) => <div className="skeleton-card" key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1>Admin Dashboard</h1>
        <div className="alert-error">{error}</div>
      </div>
    );
  }

  const { stats, revenue_trend, motorcycle_distribution, contract_status } = data;

  const cards = [
    { label: 'Total Users', value: stats.total_users },
    { label: 'Total Managers', value: stats.total_managers },
    { label: 'Available Motorcycles', value: stats.available_motorcycles },
    { label: 'Contracted Motorcycles', value: stats.contracted_motorcycles },
    { label: 'Sold Motorcycles', value: stats.sold_motorcycles },
    { label: 'Total Revenue (TZS)', value: Number(stats.total_revenue).toLocaleString() },
  ];

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <p className="page-subtitle">Overview of your system's performance</p>

      <div className="stats-grid" style={{ marginTop: 20 }}>
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <p className="stat-value">{c.value}</p>
            <p className="stat-label">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Revenue Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenue_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#1E3A8A" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Motorcycle Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={motorcycle_distribution} dataKey="count" nameKey="status" outerRadius={90} label>
                {motorcycle_distribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Contract Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={contract_status}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="section-heading">Admin Tools</h2>
      <div className="tools-grid">
        {adminTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link to={tool.to} className="tool-card" key={tool.to}>
              <div className="tool-icon"><Icon size={22} /></div>
              <div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}