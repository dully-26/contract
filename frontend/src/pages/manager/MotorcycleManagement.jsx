import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { storageUrl } from '../../utils/storage';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { validateMotorcycleForm } from '../../utils/validation';

const emptyForm = {
  brand: '', model: '', year: '', daily_price: '', monthly_price: '',
  total_contract_price: '', sale_price: '', condition: 'used', listing_type: 'contract',
};

export default function MotorcycleManagement() {
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMotorcycles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/motorcycles', { params: { search } });
      setMotorcycles(res.data.data || res.data);
    } catch (err) {
      setMessage('Failed to load motorcycles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMotorcycles(); }, [search]);

  const openAddModal = () => {
    setForm(emptyForm);
    setPhotos([]);
    setEditingId(null);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (m) => {
    setForm({
      brand: m.brand, model: m.model, year: m.year,
      daily_price: m.daily_price || '', monthly_price: m.monthly_price || '',
      total_contract_price: m.total_contract_price || '',
      sale_price: m.sale_price || '',
      condition: m.condition, listing_type: m.listing_type,
    });
    setPhotos([]);
    setEditingId(m.id);
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateMotorcycleForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      if (editingId) {
        // Editing uses plain JSON (no files re-uploaded here)
        await api.put(`/motorcycles/${editingId}`, form);
        setMessage('Motorcycle updated successfully');
      } else {
        const data = new FormData();

        data.append('brand', form.brand);
        data.append('model', form.model);
        data.append('year', form.year);
        data.append('condition', form.condition);
        data.append('listing_type', form.listing_type);

        if (form.listing_type === 'contract') {
          data.append('daily_price', form.daily_price);
          data.append('monthly_price', form.monthly_price);
          data.append('total_contract_price', form.total_contract_price);
        } else {
          data.append('sale_price', form.sale_price);
        }

        photos.forEach((p) => data.append('photos[]', p));

        // IMPORTANT: do NOT manually set Content-Type — axios/browser sets
        // the correct multipart boundary automatically for FormData.
        await api.post('/motorcycles', data);
        setMessage('Motorcycle added successfully');
      }
      setShowModal(false);
      fetchMotorcycles();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const flat = {};
        Object.keys(apiErrors).forEach((k) => { flat[k] = apiErrors[k][0]; });
        setErrors(flat);
      } else {
        setErrors({ general: err.response?.data?.message || 'Operation failed. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (id, status) => {
    await api.patch(`/motorcycles/${id}/status`, { status });
    fetchMotorcycles();
  };

  const deleteMotorcycle = async (id) => {
    if (!window.confirm('Are you sure you want to remove this motorcycle?')) return;
    await api.delete(`/motorcycles/${id}`);
    setMessage('Motorcycle removed');
    fetchMotorcycles();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Motorcycle Management</h1>
          <p className="page-subtitle">Add, edit, and manage all motorcycles in the system</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="search-input" placeholder="Search brand or model..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn-outline-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <Plus size={16} /> Add Motorcycle
          </button>
        </div>
      </div>

      {message && <div className="alert-success">{message}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading motorcycles...</p>
      ) : motorcycles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏍️</div>
          <p>No motorcycles found. Click "Add Motorcycle" to create one.</p>
        </div>
      ) : (
        <div className="card-grid">
          {motorcycles.map((m) => (
            <div className="motorcycle-card" key={m.id}>
              <div className="card-image">
                {m.photos?.[0] ? (
                  <img src={storageUrl(m.photos[0])} alt={m.model} />
                ) : (
                  <div className="no-image">🏍️ No Image</div>
                )}
                <span className={`status-badge status-${m.status}`}>{m.status}</span>
              </div>
              <div className="card-body">
                <h3>{m.brand} {m.model}</h3>
                <p className="year">{m.year} • {m.condition} • {m.listing_type}</p>

                {m.listing_type === 'contract' ? (
                  <>
                    <div className="price-row">
                      <span>Daily: TZS {Number(m.daily_price).toLocaleString()}</span>
                      <span>Monthly: TZS {Number(m.monthly_price).toLocaleString()}</span>
                    </div>
                    <p className="total-price">TZS {Number(m.total_contract_price).toLocaleString()}</p>
                  </>
                ) : (
                  <p className="total-price">TZS {Number(m.sale_price).toLocaleString()}</p>
                )}

                <select
                  value={m.status}
                  onChange={(e) => changeStatus(m.id, e.target.value)}
                  style={{ width: '100%', padding: 8, marginBottom: 10, borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5 }}
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="sold">Sold</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>

                <div className="card-actions">
                  <button className="btn-small btn-edit" onClick={() => openEditModal(m)}>
                    <Pencil size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Edit
                  </button>
                  <button className="btn-small btn-delete" onClick={() => deleteMotorcycle(m.id)}>
                    <Trash2 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            <h2>{editingId ? 'Edit Motorcycle' : 'Add New Motorcycle'}</h2>

            {errors.general && <div className="alert-error">{errors.general}</div>}

            <form onSubmit={handleSubmit} className="contract-form" style={{ padding: 0, boxShadow: 'none', border: 'none' }}>
              <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              {errors.brand && <span className="field-error">{errors.brand}</span>}

              <input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              {errors.model && <span className="field-error">{errors.model}</span>}

              <input type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              {errors.year && <span className="field-error">{errors.year}</span>}

              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>

              <select
                value={form.listing_type}
                onChange={(e) => setForm({ ...form, listing_type: e.target.value })}
                disabled={!!editingId}
              >
                <option value="contract">For Contract</option>
                <option value="sale">For Sale</option>
              </select>

              {form.listing_type === 'contract' ? (
                <>
                  <input type="number" placeholder="Daily Price (TZS)" value={form.daily_price} onChange={(e) => setForm({ ...form, daily_price: e.target.value })} />
                  {errors.daily_price && <span className="field-error">{errors.daily_price}</span>}

                  <input type="number" placeholder="Monthly Price (TZS)" value={form.monthly_price} onChange={(e) => setForm({ ...form, monthly_price: e.target.value })} />
                  {errors.monthly_price && <span className="field-error">{errors.monthly_price}</span>}

                  <input type="number" placeholder="Total Contract Price (TZS)" value={form.total_contract_price} onChange={(e) => setForm({ ...form, total_contract_price: e.target.value })} />
                  {errors.total_contract_price && <span className="field-error">{errors.total_contract_price}</span>}
                </>
              ) : (
                <>
                  <input type="number" placeholder="Selling Price (TZS)" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
                  {errors.sale_price && <span className="field-error">{errors.sale_price}</span>}
                </>
              )}

              {!editingId && (
                <>
                  <input type="file" multiple accept="image/*" onChange={(e) => setPhotos([...e.target.files])} />
                  {photos.length > 0 && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -4, marginBottom: 8 }}>
                      {photos.length} photo(s) selected
                    </p>
                  )}
                </>
              )}

              <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: 16 }}>
                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Motorcycle'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}