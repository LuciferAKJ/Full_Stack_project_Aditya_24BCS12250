import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Brain, LayoutDashboard, Users, CalendarClock,
  ClipboardList, LogOut, Camera, ChevronRight
} from 'lucide-react';
import './DashboardLayout.css';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: '/dashboard/students', icon: <Users size={18} />, label: 'Students' },
  { to: '/dashboard/sessions', icon: <CalendarClock size={18} />, label: 'Sessions' },
  { to: '/dashboard/attendance', icon: <ClipboardList size={18} />, label: 'Attendance' },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dash-layout">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon"><Brain size={20} /></div>
          <span>Attend<span className="gradient-text">AI</span></span>
        </div>

        <div className="sidebar__user">
          <div className="sidebar__user-avatar">
            {(user?.name || user?.email || 'T')[0].toUpperCase()}
          </div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user?.name || 'Teacher'}</div>
            <div className="sidebar__user-role">
              <span className="badge badge-info" style={{ fontSize: '10px', padding: '2px 8px' }}>
                {user?.role || 'TEACHER'}
              </span>
            </div>
          </div>
        </div>

        <div className="sidebar__divider" />
        <nav className="sidebar__nav">
          <div className="sidebar__nav-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
              }
            >
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-label-text">{item.label}</span>
              <ChevronRight size={14} className="sidebar__nav-chevron" />
            </NavLink>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <button className="sidebar__logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </aside>
      <main className="dash-main">
        <div className="dash-main__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
