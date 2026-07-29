import { useEffect, useState } from 'react';
import { Wallet, Search } from 'lucide-react';
import api from '../../api/axios';
import { validateCashPaymentForm } from '../../utils/validation';

export default function RecordPayment() {
  const [contracts, setContracts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchActiveContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contracts');
      setContracts(res.data.filter((c) => c.status === 'active'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActiveContracts(); }, []);

  const filtered = contracts.filter((c) =>
    `${c.user.full_name} ${c.motorcycle.brand} ${c.motorcycle.model}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleRecord = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const errs = validateCashPaymentForm({
      contract_id: selectedContract?.id,
      amount,
      balance: selectedContract?.balance,
    });

    if (Object.keys(errs).length > 0) {
      setError(Object.values(errs)[0]);
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/payments/cash', {
        contract_id: selectedContract.id,
        amount: Number(amount),
      });
      setMessage(`TZS ${Number(amount).toLocaleString()} recorded successfully for ${selectedContract.user.full_name}`);
      setAmount('');
      setSelectedContract(null);
      fetchActiveContracts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h1>Record Cash Payment</h1>
      <p className="page-subtitle">Record a daily or monthly cash payment received from a customer</p>

      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      <div className="record-payment-layout">
        <div className="table-wrapper" style={{ flex: 1.4 }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
              <input
                className="search-input"
                style={{ width: '100%', paddingLeft: 34 }}
                placeholder="Search customer or motorcycle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p style={{ padding: 20, color: 'var(--text-muted)' }}>Loading active contracts...</p>
          ) : filtered.length === 0 ? (
            <p style={{ padding: 20, color: 'var(--text-muted)' }}>No active contracts found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Motorcycle</th><th>Balance</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={selectedContract?.id === c.id ? 'selected-row' : ''}
                    onClick={() => setSelectedContract(c)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{c.user.full_name}</td>
                    <td>{c.motorcycle.brand} {c.motorcycle.model}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 700 }}>TZS {Number(c.balance).toLocaleString()}</td>
                    <td>
                      <button
                        className={`btn-small ${selectedContract?.id === c.id ? 'btn-approve' : 'btn-edit'}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedContract(c); }}
                      >
                        {selectedContract?.id === c.id ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="contract-form" style={{ flex: 1, alignSelf: 'flex-start', position: 'sticky', top: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="tool-icon"><Wallet size={20} /></div>
            <h3 style={{ margin: 0, color: 'var(--text)' }}>Payment Details</h3>
          </div>

          {selectedContract ? (
            <>
              <div className="selected-contract-summary">
                <p><strong>{selectedContract.user.full_name}</strong></p>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {selectedContract.motorcycle.brand} {selectedContract.motorcycle.model}
                </p>
                <div className="contract-amounts" style={{ marginTop: 12 }}>
                  <div>
                    <span className="amount-label">Total</span>
                    <span className="amount-value">TZS {Number(selectedContract.total_amount).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="amount-label">Balance</span>
                    <span className="amount-value balance-highlight">TZS {Number(selectedContract.balance).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRecord}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginTop: 16, marginBottom: 6 }}>
                  Amount Received (TZS)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: 12 }}>
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </form>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, textAlign: 'center', padding: '30px 0' }}>
              Select a customer from the list to record their cash payment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}