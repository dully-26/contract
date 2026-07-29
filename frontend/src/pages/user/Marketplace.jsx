import { useEffect, useState } from 'react';
import api from '../../api/axios';
import LocationViewer from '../../components/LocationViewer';

export default function Marketplace() {
  const [motorcycles, setMotorcycles] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [expandedMap, setExpandedMap] = useState(null);

  const fetchListings = async () => {
    const res = await api.get('/marketplace', { params: { search } });
    setMotorcycles(res.data.data);
  };

  useEffect(() => { fetchListings(); }, [search]);

  const requestPurchase = async (motorcycleId) => {
    try {
      await api.post('/marketplace/purchase-requests', { motorcycle_id: motorcycleId });
      setMessage('Purchase request sent to seller!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Motorcycle Marketplace</h1>
        <input className="search-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {message && <div className="alert-success">{message}</div>}

      <div className="card-grid">
        {motorcycles.map((m) => (
          <div className="motorcycle-card" key={m.id}>
            <div className="card-image">
              {m.photos?.[0] ? (
                <img src={`http://localhost:8000/storage/${m.photos[0]}`} alt={m.model} />
              ) : <div className="no-image">No Image</div>}
            </div>
            <div className="card-body">
              <h3>{m.brand} {m.model}</h3>
              <p className="year">{m.year} • {m.condition}</p>
              <p className="total-price">TZS {Number(m.sale_price).toLocaleString()}</p>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
                Seller: {m.owner?.full_name} • {m.owner?.phone}
              </p>
              {m.location_name && <p style={{ fontSize: 12, marginBottom: 6 }}>📍 {m.location_name}</p>}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={() => requestPurchase(m.id)}>Request to Buy</button>
                {m.latitude && (
                  <button className="btn-small" onClick={() => setExpandedMap(expandedMap === m.id ? null : m.id)}>
                    {expandedMap === m.id ? 'Hide Map' : 'View Map'}
                  </button>
                )}
              </div>

              {expandedMap === m.id && (
                <div style={{ marginTop: 10 }}>
                  <LocationViewer latitude={m.latitude} longitude={m.longitude} label={`${m.brand} ${m.model}`} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}