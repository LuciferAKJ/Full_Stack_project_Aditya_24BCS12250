import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Users, CalendarClock, ClipboardList, Camera,
  TrendingUp, ArrowRight, Clock, CheckCircle, Plus
} from 'lucide-react';
import './Dashboard.css';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const mockStats = [
  { icon: <Users size={22} />, label: 'Total Students', value: '124', color: '#00a8ff', bg: 'rgba(0,168,255,0.12)' },
  { icon: <CalendarClock size={22} />, label: "Today's Sessions", value: '4', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  { icon: <ClipboardList size={22} />, label: 'Attendance Today', value: '87', color: '#00e676', bg: 'rgba(0,230,118,0.12)' },
  { icon: <TrendingUp size={22} />, label: 'Avg Attendance %', value: '82%', color: '#ffd600', bg: 'rgba(255,214,0,0.12)' },
];

const recentSessions = [
  { id: 1, class: 'CS-301', slot: '09:30 – 10:20 AM', date: '2026-03-09', present: 28, total: 35 },
  { id: 2, class: 'CS-401', slot: '10:20 – 11:10 AM', date: '2026-03-09', present: 31, total: 38 },
  { id: 3, class: 'IT-201', slot: '11:20 – 12:10 PM', date: '2026-03-08', present: 22, total: 30 },
];

const quickActions = [
  { to: '/dashboard/sessions', icon: <CalendarClock size={20} />, label: 'New Session', color: '#00a8ff' },
  { to: '/dashboard/students', icon: <Users size={20} />, label: 'Register Student', color: '#7c3aed' },
  { to: '/dashboard/attendance', icon: <ClipboardList size={20} />, label: 'View Attendance', color: '#00e676' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="dashboard">
      <motion.div className="dashboard__greeting" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <div>
          <h1 className="dashboard__greeting-title">
            {greeting}, <span className="gradient-text">{user?.name || 'Teacher'}</span> 👋
          </h1>
          <p className="dashboard__greeting-sub">
            {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/dashboard/sessions" className="btn btn-primary">
          <Plus size={16} /> New Session
        </Link>
      </motion.div>
      <div className="dashboard__stats">
        {mockStats.map((s, i) => (
          <motion.div key={i} className="stat-card" variants={fadeUp} initial="hidden" animate="visible" custom={i * 0.1 + 0.1}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard__grid">
        <motion.div className="card" variants={fadeUp} initial="hidden" animate="visible" custom={0.3}>
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">
              <Clock size={18} /> Recent Sessions
            </h2>
            <Link to="/dashboard/sessions" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Time Slot</th>
                  <th>Date</th>
                  <th>Attendance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => {
                  const pct = Math.round((s.present / s.total) * 100);
                  return (
                    <tr key={s.id}>
                      <td><span className="badge badge-info">{s.class}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.slot}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.date}</td>
                      <td>
                        <div className="attendance-bar">
                          <div className="attendance-bar__fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {s.present}/{s.total} ({pct}%)
                        </span>
                      </td>
                      <td>
                        <Link to={`/dashboard/attendance/${s.id}/scan`} className="btn btn-ghost btn-sm">
                          <Camera size={13} /> Scan
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <motion.div className="card" variants={fadeUp} initial="hidden" animate="visible" custom={0.4}>
            <h2 className="dashboard__card-title" style={{ marginBottom: 'var(--space-md)' }}>
              Quick Actions
            </h2>
            <div className="quick-actions">
              {quickActions.map((a, i) => (
                <Link key={i} to={a.to} className="quick-action-btn">
                  <div className="quick-action-icon" style={{ background: `${a.color}1a`, color: a.color }}>
                    {a.icon}
                  </div>
                  <span>{a.label}</span>
                  <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                </Link>
              ))}
            </div>
          </motion.div>
          <motion.div className="card" variants={fadeUp} initial="hidden" animate="visible" custom={0.5}>
            <h2 className="dashboard__card-title" style={{ marginBottom: 'var(--space-md)' }}>
              Today's Overview
            </h2>
            <div className="today-overview">
              {[
                { label: 'CS-301 — 9:30 AM', status: 'completed' },
                { label: 'CS-401 — 10:20 AM', status: 'completed' },
                { label: 'IT-201 — 11:20 AM', status: 'upcoming' },
                { label: 'IT-301 — 12:10 PM', status: 'upcoming' },
              ].map((item, i) => (
                <div key={i} className="today-item">
                  <CheckCircle
                    size={16}
                    style={{ color: item.status === 'completed' ? 'var(--success)' : 'var(--text-muted)' }}
                  />
                  <span style={{ color: item.status === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {item.label}
                  </span>
                  <span className={`badge badge-${item.status === 'completed' ? 'success' : 'info'}`}
                    style={{ marginLeft: 'auto', fontSize: '10px' }}>
                    {item.status === 'completed' ? 'Done' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
