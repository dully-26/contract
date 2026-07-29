import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const fetchAll = async () => {
    const [notifRes, countRes] = await Promise.all([
      api.get('/notifications'),
      api.get('/notifications/unread-count'),
    ]);
    setNotifications(notifRes.data);
    setUnread(countRes.data.count);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/mark-all-read');
    fetchAll();
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    fetchAll();
  };

  return (
    <div className="notif-wrapper" ref={ref}>
      <button className="notif-bell" onClick={() => setOpen(!open)}>
        🔔 {unread > 0 && <span className="notif-badge">{unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notifications</span>
            <button onClick={markAllRead}>Mark all read</button>
          </div>
          <div className="notif-list">
            {notifications.length === 0 && <p className="notif-empty">No notifications</p>}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                onClick={() => markRead(n.id)}
              >
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <span className="notif-time">{new Date(n.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}