import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock } from 'lucide-react';
import api from '../../api/axios';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contract-requests');
      setRequests(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  return (
    <div className="page">
      <h1>My Contract Requests</h1>
      <p className="page-subtitle">Track the status of your motorcycle contract requests</p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', marginTop: 20 }}>Loading...</p>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>You haven't requested any motorcycle contracts yet.</p>
          <Link to="/motorcycles" className="btn-outline-primary" style={{ marginTop: 12, display: 'inline-block', textDecoration: 'none' }}>
            Browse Motorcycles
          </Link>
        </div>
      ) : (
        <div className="table-wrapper" style={{ marginTop: 20 }}>
          <table className="data-table">
            <thead>
              <tr><th>Motorcycle</th><th>Requested On</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.motorcycle.brand} {r.motorcycle.model}</td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                  <td>
                    {r.status === 'pending' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--warning)', fontSize: 12.5, fontWeight: 600 }}>
                        <Clock size={14} /> Awaiting review
                      </span>
                    )}

                    {r.status === 'approved' && !r.contract && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12.5 }}>
                        Approved — contract being prepared
                      </span>
                    )}

                    {r.status === 'approved' && r.contract && (
                      <Link to="/payments" className="btn-small btn-approve" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                        <FileText size={13} /> View Contract
                      </Link>
                    )}

                    {r.status === 'rejected' && (
                      <span style={{ color: 'var(--danger)', fontSize: 12.5, fontWeight: 600 }}>Not approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}