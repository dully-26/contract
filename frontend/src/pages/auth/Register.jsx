import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateRegisterForm } from '../../utils/validation';

export default function Register() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', address: '',
    password: '', password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {errors.general && <div className="alert-error">{errors.general}</div>}

        <label>Full Name</label>
        <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        {errors.full_name && <span className="field-error">{errors.full_name}</span>}

        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errors.email && <span className="field-error">{errors.email}</span>}

        <label>Phone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {errors.phone && <span className="field-error">{errors.phone}</span>}

        <label>Address</label>
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {errors.password && <span className="field-error">{errors.password}</span>}

        <label>Confirm Password</label>
        <input type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
        {errors.password_confirmation && <span className="field-error">{errors.password_confirmation}</span>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="switch-auth">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}