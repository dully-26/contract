import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Bike, Eye } from 'lucide-react';
import api from '../../api/axios';

export default function Payments() {
  const [contracts, setContracts] = useState([]);
  const [amountInputs, setAmountInputs] = useState({});
  const [payingId, setPayingId] = useState(null);
  const [openPayId, setOpenPayId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  const loadFlutterwaveScript = () =>
    new Promise((resolve, reject) => {
      if (window.FlutterwaveCheckout) return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

  const payWithFlutterwave = async (contract) => {
    setError('');
    setMessage('');
    const amount = Number(amountInputs[contract.id]);

    if (!amount || amount <= 0) {
      setError('Enter a valid payment amount');
      return;
    }
    if (amount > contract.balance) {
      setError('Amount exceeds outstanding balance');
      return;
    }

    try {
      setPayingId(contract.id);
      await loadFlutterwaveScript();

      const initRes = await api.post('/payments/initiate', {
        contract_id: contract.id,
        amount,
      });
      const { tx_ref, public_key, customer, description } = initRes.data;

      window.FlutterwaveCheckout({
        public_key,
        tx_ref,
        amount,
        currency: 'TZS',
        payment_options: 'card, mobilemoneyghana, mobilemoneytanzania, mobilemoneyrwanda, ussd',
        customer: {
          email: customer.email,
          phone_number: customer.phone,
          name: customer.name,
        },
        customizations: {
          title: 'Motorcycle Contract Payment',
          description,
          logo: '',
        },
        callback: async (response) => {
          try {
            await api.post('/payments/verify', {
              tx_ref: response.tx_ref,
              transaction_id: response.transaction_id,
            });
            setMessage('Payment verified and applied to your contract!');
            setOpenPayId(null);
            fetchContracts();
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed. Contact support.');
          } finally {
            setPayingId(null);
          }
        },
        onclose: () => {
          setPayingId(null);
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start payment');
      setPayingId(null);
    }
  };

  const progressPercent = (contract) => {
    if (!contract.total_amount || contract.total_amount == 0) return 0;
    return Math.min(100, Math.round((contract.paid_amount / contract.total_amount) * 100));
  };

  return (
    <div className="page">
      <h1>My Contracts & Payments</h1>
      <p className="page-subtitle">Track your contracts, balances, and make payments</p>

      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', marginTop: 20 }}>Loading contracts...</p>
      ) : contracts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <p>You don't have any contracts yet.</p>
        </div>
      ) : (
        <div className="card-grid contract-cards-grid" style={{ marginTop: 20 }}>
          {contracts.map((c) => (
            <div className="motorcycle-card contract-card" key={c.id}>
              <div className="contract-card-header">
                <div className="contract-icon"><Bike size={20} /></div>
                <div>
                  <h3>{c.motorcycle.brand} {c.motorcycle.model}</h3>
                  <p className="year">{c.motorcycle.year} • Contract #{c.id}</p>
                </div>
                <span className={`status-badge status-${c.status}`} style={{ position: 'static' }}>{c.status}</span>
              </div>

              <div className="card-body">
                {!c.accepted_at && c.status === 'active' && (
                  <div className="not-accepted-tag">Bado hujakubali masharti ya mkataba huu</div>
                )}

                <div className="contract-progress-row">
                  <span>Paid: TZS {Number(c.paid_amount).toLocaleString()}</span>
                  <span>{progressPercent(c)}%</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${progressPercent(c)}%` }} />
                </div>

                <div className="contract-amounts">
                  <div>
                    <span className="amount-label">Total</span>
                    <span className="amount-value">TZS {Number(c.total_amount).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="amount-label">Balance</span>
                    <span className="amount-value balance-highlight">TZS {Number(c.balance).toLocaleString()}</span>
                  </div>
                </div>

                {c.status === 'active' && c.accepted_at && (
                  <>
                    {openPayId === c.id ? (
                      <div className="pay-box">
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={amountInputs[c.id] || ''}
                          onChange={(e) => setAmountInputs({ ...amountInputs, [c.id]: e.target.value })}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button
                            className="btn-small btn-approve"
                            style={{ flex: 1 }}
                            disabled={payingId === c.id}
                            onClick={() => payWithFlutterwave(c)}
                          >
                            {payingId === c.id ? 'Processing...' : 'Confirm & Pay'}
                          </button>
                          <button className="btn-small" style={{ flex: 1 }} onClick={() => setOpenPayId(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => setOpenPayId(c.id)}>
                        Make a Payment
                      </button>
                    )}
                  </>
                )}

                <Link
                  to={`/contracts/${c.id}`}
                  className="btn-outline-primary"
                  style={{ width: '100%', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <Eye size={14} /> {c.accepted_at ? 'Soma / Pakua Mkataba' : 'Soma Mkataba Kabla ya Kukubali'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}