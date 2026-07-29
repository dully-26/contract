import { useEffect, useState } from 'react';
import { ScrollText, User, Globe, Clock } from 'lucide-react';
import api from '../../api/axios';

const actionColors = {
  approved: 'var(--success)',
  rejected: 'var(--danger)',
  deleted: 'var(--danger)',
  created: 'var(--primary)',
  updated: 'var(--secondary)',
  edited: 'var(--secondary)',
  recorded: 'var(--success)',
  submitted: 'var(--primary-light)',
};

const getActionColor = (action) => {
  const key = Object.keys(actionColors).find((k) => action.includes(k));
  return key ? actionColors[key] : 'var(--text-muted)';
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const fetchLogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', { params: { page: pageNum, action: search || undefined } });
      setLogs(res.data.data);
      setMeta({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (err) {
      // fail silently, empty state will show
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(page); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Activity Logs</h1>
          <p className="page-subtitle">Track every important action performed across the system</p>
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            className="search-input"
            placeholder="Filter by action (e.g. approved, deleted)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-outline-primary">Filter</button>
        </form>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading activity logs...</p>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <p>No activity logs found.</p>
        </div>
      ) : (
        <>
          <div className="audit-log-list">
            {logs.map((log) => (
              <div className="audit-log-item" key={log.id}>
                <div className="audit-log-icon" style={{ background: `${getActionColor(log.action)}1A`, color: getActionColor(log.action) }}>
                  <ScrollText size={16} />
                </div>
                <div className="audit-log-content">
                  <div className="audit-log-top">
                    <span className="audit-log-action">{log.action.replaceAll('_', ' ')}</span>
                    <span className="audit-log-time">
                      <Clock size={12} /> {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  {log.description && <p className="audit-log-desc">{log.description}</p>}
                  <div className="audit-log-meta">
                    <span><User size={12} /> {log.user?.full_name || 'System'} {log.user?.role && `(${log.user.role})`}</span>
                    {log.ip_address && <span><Globe size={12} /> {log.ip_address}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="pagination-row">
              <button
                className="btn-small"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Page {meta.current_page} of {meta.last_page} ({meta.total} logs)
              </span>
              <button
                className="btn-small"
                disabled={page === meta.last_page}
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}