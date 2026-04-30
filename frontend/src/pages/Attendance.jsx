import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ClipboardList, Search, Filter, Download, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import './Attendance.css';

const CLASSES = ['CS-301', 'CS-401', 'IT-201', 'IT-301', 'EC-201', 'ME-301'];

const mockAttendance = [
  { id: 1, uid: 'CS21001', name: 'Aarav Sharma', class: 'CS-301', session: 'CS-301 — 09:30 AM', date: '2026-03-09', time: '09:32 AM', status: 'Present' },
  { id: 2, uid: 'CS21002', name: 'Priya Patel', class: 'CS-301', session: 'CS-301 — 09:30 AM', date: '2026-03-09', time: '09:33 AM', status: 'Present' },
  { id: 3, uid: 'IT21001', name: 'Rohit Mehta', class: 'IT-201', session: 'IT-201 — 11:20 AM', date: '2026-03-09', time: '11:24 AM', status: 'Present' },
  { id: 4, uid: 'CS41001', name: 'Sneha Gupta', class: 'CS-401', session: 'CS-401 — 10:20 AM', date: '2026-03-08', time: '10:21 AM', status: 'Present' },
  { id: 5, uid: 'CS21003', name: 'Vikram Singh', class: 'CS-301', session: 'CS-301 — 09:30 AM', date: '2026-03-09', time: '09:35 AM', status: 'Present' },
  { id: 6, uid: 'CS21004', name: 'Ananya Roy', class: 'CS-301', session: 'CS-301 — 09:30 AM', date: '2026-03-08', time: '09:31 AM', status: 'Present' },
];

const Attendance = () => {
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const filtered = mockAttendance.filter(r => {
    if (!filterClass) return false;
    const q = search.toLowerCase();
    const matchSearch = r.name.toLowerCase().includes(q) || r.uid.toLowerCase().includes(q);
    const matchClass = r.class === filterClass;
    const matchDate = filterDate ? r.date === filterDate : true;
    return matchSearch && matchClass && matchDate;
  });

  const classesWithData = [...new Set(mockAttendance.map(r => r.class))];

  const exportToExcel = () => {
    const data = filtered.map(r => ({
      'UID': r.uid,
      'Student Name': r.name,
      'Class': r.class,
      'Session': r.session,
      'Date': r.date,
      'Time': r.time,
      'Status': r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `attendance_${filterDate || 'all'}_${filterClass || 'all_classes'}.xlsx`);
    toast.success('Attendance exported to Excel! 📊');
  };

  return (
    <div className="attendance-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Records</h1>
          <p className="page-subtitle">
            {filterClass
              ? `${filtered.length} record${filtered.length !== 1 ? 's' : ''} for ${filterClass}`
              : 'Select a class to view attendance records'}
          </p>
        </div>
        {filterClass && (
          <button id="export-excel-btn" className="btn btn-primary" onClick={exportToExcel}>
            <Download size={16} /> Export Excel
          </button>
        )}
      </div>
      <div className="attendance-class-selector">
        <div className="attendance-class-selector__label">
          <Filter size={15} /> Choose Class
        </div>
        <div className="attendance-class-selector__grid">
          {CLASSES.map(c => (
            <button
              key={c}
              className={`class-pick-btn ${filterClass === c ? 'active' : ''} ${!classesWithData.includes(c) ? 'no-data' : ''}`}
              onClick={() => { setFilterClass(c); setSearch(''); setFilterDate(''); }}
            >
              {c}
              {classesWithData.includes(c) && (
                <span className="class-pick-btn__count">
                  {mockAttendance.filter(r => r.class === c).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {filterClass && (
        <motion.div className="attendance-filters card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="attendance-filters__title">
            <Search size={16} /> Filter within {filterClass}
          </div>
          <div className="attendance-filters__row">
            <div className="input-wrapper" style={{ flex: 1 }}>
              <div className="input-icon"><Search size={15} /></div>
              <input
                id="attendance-search"
                className="form-input auth-input"
                placeholder="Search by name or UID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
              <input id="attendance-date-filter" type="date" className="form-input"
                value={filterDate} onChange={e => setFilterDate(e.target.value)}
                style={{ maxWidth: 160 }} />
            </div>
            {(search || filterDate) && (
              <button className="btn btn-ghost btn-sm"
                onClick={() => { setSearch(''); setFilterDate(''); }}>
                Clear
              </button>
            )}
          </div>
        </motion.div>
      )}
      {!filterClass ? (
        <div className="attendance-no-class-prompt">
          <div className="attendance-no-class-prompt__icon">
            <ClipboardList size={36} />
          </div>
          <h3>Pick a Class Above to See Records</h3>
          <p>Attendance data is organised class-wise. Select any class from the grid to view its records.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <h3>No records found for {filterClass}</h3>
          <p>Start a camera scan session for this class to record attendance.</p>
        </div>
      ) : (
        <motion.div className="table-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>UID</th>
                <th>Student Name</th>
                <th>Session</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td><code style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>{r.uid}</code></td>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.session}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.date}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>{r.time}</td>
                  <td><span className="badge badge-success">✓ {r.status}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
      <div className="attendance-summary">
        <div className="attendance-summary__item">
          <span style={{ color: 'var(--text-muted)' }}>Total Records</span>
          <strong>{filtered.length}</strong>
        </div>
        <div className="attendance-summary__item">
          <span style={{ color: 'var(--text-muted)' }}>Classes</span>
          <strong>{[...new Set(filtered.map(r => r.class))].length}</strong>
        </div>
        <div className="attendance-summary__item">
          <span style={{ color: 'var(--text-muted)' }}>Unique Students</span>
          <strong>{[...new Set(filtered.map(r => r.uid))].length}</strong>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
