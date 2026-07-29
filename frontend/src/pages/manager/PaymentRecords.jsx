import { useEffect, useState } from 'react';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import api from '../../api/axios';

const methodIcons = {
  cash: Banknote,
  flutterwave: Smartphone,
  system: CreditCard,
};

export default function PaymentRecords() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState('all');

  useEffect(() => {
    api.get('/payments').then((res) => setPayments(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = filterMethod === 'all' ? payments : payments.filter((p) => p.method === filterMethod);
  const totalAmount = filtered.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="page">
      <h1>Payment Records</h1>
      <p className="page-subtitle">All payments received across all contracts</p>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <p className="stat-value">{filtered.length}</p>
          <p className="stat-label">Total Transactions</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">TZS {totalAmount.toLocaleString()}</p>
          <p className="stat-label">Total Amount Collected</p>
        </div>
      </div>

      <div className="tabs-row">
        <button className={`tab-btn ${filterMethod === 'all' ? 'active' : ''}`} onClick={() => setFilterMethod('all')}>All</button>
        <button className={`tab-btn ${filterMethod === 'cash' ? 'active' : ''}`} onClick={() => setFilterMethod('cash')}>Cash</button>
        <button className={`tab-btn ${filterMethod === 'flutterwave' ? 'active' : ''}`} onClick={() => setFilterMethod('flutterwave')}>Online</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading payment records...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <p>No payment records found.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Reference</th><th>Customer</th><th>Motorcycle</th><th>Method</th><th>Amount</th><th>Date</th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const Icon = methodIcons[p.method] || CreditCard;
                return (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.reference}</td>
                    <td>{p.user.full_name}</td>
                    <td>{p.contract?.motorcycle?.brand} {p.contract?.motorcycle?.model}</td>
                    <td>
                      <span className="payment-method-tag">
                        <Icon size={13} /> {p.method === 'flutterwave' ? 'Online' : p.method === 'cash' ? 'Cash' : 'System'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>TZS {Number(p.amount).toLocaleString()}</td>
                    <td>{new Date(p.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}