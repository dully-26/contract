import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import api from '../../api/axios';
import { storageUrl } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(user?.profile_photo ? storageUrl(user.profile_photo) : null);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setPhoto(file);

    const data = new FormData();
    data.append('photo', file);

    setUploading(true);
    setError('');
    try {
      const res = await api.post('/profile/photo', data);
      setMessage('Picha ya profaili imesasishwa!');
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser?.(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Imeshindwa kupakia picha');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.put('/profile', form);
      setMessage('Taarifa zimesasishwa kwa mafanikio!');
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser?.(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Imeshindwa kusasisha taarifa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h1>Profaili Yangu</h1>
      <p className="page-subtitle">Sasisha picha na taarifa zako binafsi</p>

      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      <div className="contract-form" style={{ maxWidth: 480 }}>
        <div className="profile-photo-upload">
          <div className="profile-photo-preview">
            {preview ? (
              <img src={preview} alt="Profile" />
            ) : (
              <div className="profile-photo-placeholder">
                {user?.full_name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            )}
            <label className="profile-photo-edit-btn">
              <Camera size={14} />
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
            </label>
          </div>
          {uploading && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Inapakia...</p>}
        </div>

        <form onSubmit={handleSaveInfo} style={{ marginTop: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Jina Kamili</label>
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />

          <label style={{ fontSize: 13, fontWeight: 600, marginTop: 10, display: 'block' }}>Simu</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <label style={{ fontSize: 13, fontWeight: 600, marginTop: 10, display: 'block' }}>Anwani</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

          <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 16 }}>
            <Save size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {saving ? 'Inahifadhi...' : 'Hifadhi Mabadiliko'}
          </button>
        </form>
      </div>
    </div>
  );
}