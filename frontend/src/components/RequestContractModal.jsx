import { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { storageUrl } from '../utils/storage';
import { validateContractRequestForm } from '../utils/validation';

export default function RequestContractModal({ motorcycle, onClose, onSuccess }) {
  const { user } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill preview with profile photo if it exists and user hasn't chosen a new one
  useEffect(() => {
    if (!photo && user?.profile_photo) {
      setPreview(storageUrl(user.profile_photo));
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errs = validateContractRequestForm({
      applicant_photo: photo || user?.profile_photo,
    });

    if (Object.keys(errs).length > 0) {
      setError(errs.applicant_photo);
      return;
    }

    const data = new FormData();
    data.append('motorcycle_id', motorcycle.id);
    if (photo) data.append('applicant_photo', photo); // only send if user picked a NEW one
    if (notes) data.append('notes', notes);

    setSubmitting(true);
    try {
      await api.post('/contract-requests', data);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Imeshindikana kuwasilisha ombi. Jaribu tena.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <h2>Omba Mkataba wa Pikipiki</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {motorcycle.brand} {motorcycle.model} ({motorcycle.year})
        </p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="contract-form" style={{ padding: 0, boxShadow: 'none', border: 'none' }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
            Picha Yako (itaonekana kwenye mkataba)
          </label>

          <div className="photo-upload-box">
            {preview ? (
              <img src={preview} alt="Preview" className="photo-preview" />
            ) : (
              <div className="photo-upload-placeholder">
                <Camera size={26} />
                <span>Bofya kupakia picha</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="photo-upload-input" />
          </div>

          {!photo && user?.profile_photo && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Tunatumia picha yako ya profaili. Bofya juu ili kubadilisha.
            </p>
          )}

          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginTop: 14, marginBottom: 6 }}>
            Maelezo ya Ziada (si lazima)
          </label>
          <textarea
            placeholder="Andika chochote unachotaka meneja aone..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: 14 }}>
            {submitting ? 'Inawasilisha...' : 'Wasilisha Ombi'}
          </button>
        </form>
      </div>
    </div>
  );
}