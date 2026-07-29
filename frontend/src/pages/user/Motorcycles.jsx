import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { storageUrl } from '../../utils/storage';
import RequestContractModal from '../../components/RequestContractModal';

export default function Motorcycles() {
  const [motorcycles, setMotorcycles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedMotorcycle, setSelectedMotorcycle] = useState(null);

  const fetchMotorcycles = async () => {
    setLoading(true);
    const res = await api.get('/motorcycles', { params: { listing_type: 'contract', search } });
    setMotorcycles(res.data.data);
    setLoading(false);
  };

  useEffect(() => { fetchMotorcycles(); }, [search]);

  const handleSuccess = () => {
    setSelectedMotorcycle(null);
    setMessage('Ombi lako limewasilishwa! Meneja atalikagua hivi karibuni.');
    fetchMotorcycles();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Available Motorcycles</h1>
        <input
          className="search-input"
          placeholder="Search brand or model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {message && <div className="alert-success">{message}</div>}
      {loading ? <p>Loading...</p> : (
        <div className="card-grid">
          {motorcycles.map((m) => (
            <div className="motorcycle-card" key={m.id}>
              <div className="card-image">
                {m.photos?.[0] ? (
                  <img src={storageUrl(m.photos[0])} alt={m.model} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <span className={`status-badge status-${m.status}`}>{m.status}</span>
              </div>
              <div className="card-body">
                <h3>{m.brand} {m.model}</h3>
                <p className="year">{m.year} • {m.condition}</p>
                <div className="price-row">
                  <span>Daily: TZS {Number(m.daily_price).toLocaleString()}</span>
                  <span>Monthly: TZS {Number(m.monthly_price).toLocaleString()}</span>
                </div>
                <p className="total-price">Total: TZS {Number(m.total_contract_price).toLocaleString()}</p>
                <button
                  className="btn-primary"
                  disabled={m.status !== 'available'}
                  onClick={() => setSelectedMotorcycle(m)}
                >
                  {m.status === 'available' ? 'Request Contract' : 'Not Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMotorcycle && (
        <RequestContractModal
          motorcycle={selectedMotorcycle}
          onClose={() => setSelectedMotorcycle(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}