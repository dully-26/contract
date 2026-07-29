import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('user');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    const res = await api.get('/users', { params: { role: filter } });
    setUsers(res.data);
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const toggleActive = async (id) => {
    await api.patch(`/users/${id}/toggle-active`);
    fetchUsers();
  };

  const resetPassword = async (id) => {
    const res = await api.post(`/users/${id}/reset-password`);
    setMessage(`New temporary password: ${res.data.temporary_password}`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>User Management</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="user">Customers</option>
          <option value="manager">Managers</option>
        </select>
      </div>
      {message && <div className="alert-success">{message}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>
                  <span className={`status-badge ${u.is_active ? 'status-available' : 'status-sold'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn-small btn-approve" onClick={() => toggleActive(u.id)}>
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn-small btn-reject" onClick={() => resetPassword(u.id)}>Reset Password</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}