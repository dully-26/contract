import { useState } from 'react';
import api from '../../api/axios';
import { validateEmail } from '../../utils/validation';

export default function AddManager() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.full_name) errs.full_name = 'Name is required';
    if (!validateEmail(form.email)) errs.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6) errs.password = 'Min 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await api.post('/managers', form);
      setMessage('Manager account created successfully!');
      setForm({ full_name: '', email: '', phone: '', password: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create manager');
    }
  };

  return (
    <div className="page">
      <h1>Add New Manager</h1>
      {message && <div className="alert-success">{message}</div>}
      <form className="contract-form" onSubmit={handleSubmit}>
        <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        {errors.full_name && <span className="field-error">{errors.full_name}</span>}

        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errors.email && <span className="field-error">{errors.email}</span>}

        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {errors.password && <span className="field-error">{errors.password}</span>}

        <button type="submit" className="btn-primary">Create Manager</button>
      </form>
    </div>
  );
}