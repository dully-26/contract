import { useState } from 'react';
import api from '../../api/axios';
import { downloadPdf } from '../../utils/downloadPdf';

export default function Reports() {
  const [range, setRange] = useState({ from: '', to: '' });
  const [data, setData] = useState(null);

  const fetchReport = async () => {
    const res = await api.get('/reports/payments', { params: range });
    setData(res.data);
  };

  return (
    <div className="page">
      <h1>Payment Reports</h1>
      <div className="page-header">
        <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        <button className="btn-small btn-approve" onClick={fetchReport}>Generate</button>
        <button className="btn-small" onClick={() => downloadPdf(`/reports/payments/export?from=${range.from}&to=${range.to}`, 'payment-report.pdf')}>
          Export PDF
        </button>
      </div>

      {data && (
        <>
          <p style={{ marginBottom: 12 }}>
            <strong>{data.count}</strong> payments totaling <strong>TZS {data.total}</strong>
          </p>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Ref</th><th>Client</th><th>Amount</th><th>Method</th><th>Date</th></tr></thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.reference}</td>
                    <td>{p.user.full_name}</td>
                    <td>TZS {p.amount}</td>
                    <td>{p.method}</td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}