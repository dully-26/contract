import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const roleLabels = {
  admin: 'Admin',
  manager: 'Manager',
  user: 'User',
};

export default function Navbar() {
  const { user } = useAuth();
  if (!user) return null;

  const firstName = user.full_name?.split(' ')[0] || '';
  const initials = user.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="navbar">
      <div className="navbar-welcome">
        <div className="navbar-welcome-title">
          Welcome, <span>{roleLabels[user.role]} {firstName}</span> 👋
        </div>
        <div className="navbar-welcome-sub">{greeting()}, here's what's happening today.</div>
      </div>

      <div className="navbar-right">
        <NotificationBell />
        <div className="navbar-user">
          <div className="navbar-avatar">{initials}</div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user.full_name}</span>
            <span className="role-tag">{user.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}