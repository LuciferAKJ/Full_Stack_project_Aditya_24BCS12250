import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock, Plus, X, Camera, Clock, Trash2, Play
} from 'lucide-react';
import './Sessions.css';

const CLASSES = ['CS-301', 'CS-401', 'IT-201', 'IT-301', 'EC-201', 'ME-301', 'CE-201', 'EE-401'];
const TIME_SLOTS = [
  '09:30 – 10:20 AM', '10:20 – 11:10 AM', '11:20 – 12:10 PM',
  '12:10 – 1:00 PM', '1:05 – 1:55 PM', '1:55 – 2:45 PM',
  '2:45 – 3:35 PM', '3:35 – 4:25 PM',
];

const mockSessions = [
  { id: 1, class: 'CS-301', slot: '09:30 – 10:20 AM', date: '2026-03-09', status: 'completed', present: 28, total: 35 },
  { id: 2, class: 'CS-401', slot: '10:20 – 11:10 AM', date: '2026-03-09', status: 'active', present: 20, total: 38 },
  { id: 3, class: 'IT-201', slot: '11:20 – 12:10 PM', date: '2026-03-08', status: 'completed', present: 22, total: 30 },
];

const Sessions = () => {
  const [sessions, setSessions] = useState(mockSessions);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ class: '', slot: '', date: new Date().toISOString().slice(0, 10) });
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.class || !form.slot) { toast.error('Select class and time slot'); return; }
    const newSession = {
      id: Date.now(), ...form, status: 'active', present: 0, total: 0,
    };
    setSessions(prev => [newSession, ...prev]);
    toast.success(`Session created for ${form.class}!`);
    setShowModal(false);
    setForm({ class: '', slot: '', date: new Date().toISOString().slice(0, 10) });
  };

  const handleDelete = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success('Session removed');
  };

  const statusColor = { completed: 'success', active: 'info', cancelled: 'error' };

  return (
    <div className="sessions-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sessions</h1>
          <p className="page-subtitle">{sessions.length} sessions recorded</p>
        </div>
        <button id="new-session-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Session
        </button>
      </div>
      <div className="sessions-grid">
        {sessions.map((s, i) => {
          const pct = s.total ? Math.round((s.present / s.total) * 100) : 0;
          return (
            <motion.div
              key={s.id}
              className="session-card card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="session-card__top">
                <div>
                  <div className="session-card__class">{s.class}</div>
                  <div className="session-card__slot">
                    <Clock size={13} /> {s.slot}
                  </div>
                </div>
                <span className={`badge badge-${statusColor[s.status] || 'info'}`}>
                  {s.status}
                </span>
              </div>

              <div className="session-card__date">📅 {s.date}</div>

              {s.total > 0 && (
                <div className="session-card__progress">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Attendance</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {s.present}/{s.total} ({pct}%)
                    </span>
                  </div>
                  <div className="attendance-bar">
                    <div className="attendance-bar__fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}

              <div className="session-card__actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/dashboard/attendance/${s.id}/scan`)}
                >
                  <Play size={13} /> Start Scan
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          );
        })}
        {sessions.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <CalendarClock size={48} />
            <h3>No sessions yet</h3>
            <p>Create a new session to start taking attendance.</p>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div className="modal" initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
              <div className="modal-header">
                <h2 className="modal-title">Create New Session</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Class Name</label>
                  <select id="session-class" className="form-select" value={form.class}
                    onChange={e => setForm({ ...form, class: e.target.value })}>
                    <option value="">Select Class</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Time Slot</label>
                  <div className="time-slots-grid">
                    {TIME_SLOTS.map((slot, i) => (
                      <button
                        key={slot}
                        type="button"
                        id={`slot-${i}`}
                        className={`time-slot-btn ${form.slot === slot ? 'selected' : ''}`}
                        onClick={() => setForm({ ...form, slot })}
                      >
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Period {i + 1}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {slot}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" id="session-date" className="form-input" value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>

                <button type="submit" id="create-session-submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                  <CalendarClock size={16} /> Create Session
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sessions;
