import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import api from '../../api/axios';
import ContractDetails from './ContractDetails';

export default function ContractsList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contracts');
      setContracts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, []);

  const handleUpdated = (updated) => {
    setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelected(updated);
  };

  return (
    <div className="page">
      <h1>All Contracts</h1>
      <p className="page-subtitle">View and edit any customer contract</p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading contracts...</p>
      ) : contracts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <p>No contracts generated yet.</p>
        </div>
      ) : (
        <div className="table-wrapper" style={{ marginTop: 20 }}>
          <table className="data-table">
            <thead>
              <tr><th>Customer</th><th>Motorcycle</th><th>Issued By</th><th>Balance</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td>{c.user?.full_name}</td>
                  <td>{c.motorcycle?.brand} {c.motorcycle?.model}</td>
                  <td>{c.issued_by?.full_name || '—'}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 700 }}>TZS {Number(c.balance).toLocaleString()}</td>
                  <td><span className={`status-badge status-${c.status}`}>{c.status}</span></td>
                  <td>
                    <button className="btn-small btn-edit" onClick={() => setSelected(c)}>
                      <Eye size={13} style={{ marginRight: 4 }} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <ContractDetails contract={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
}