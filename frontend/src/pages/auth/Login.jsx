import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validation';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!form.password) {
      setError('Password is required');
      return;
    }

    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'manager') navigate('/manager');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your account</p>
        {error && <div className="alert-error">{error}</div>}

        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
        />

        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
        />

        <p style={{ textAlign: 'right', fontSize: 12, marginTop: 6 }}>
          <Link to="/forgot-password" style={{ color: 'var(--primary)' }}>Forgot password?</Link>
        </p>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="switch-auth">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        <Link to="/" className="home-link">
          <Home size={14} /> Back to Home
        </Link>
      </form>
    </div>
  );
}