import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';
import {
  Users, Plus, X, Camera, CheckCircle, Trash2, Search, AlertCircle
} from 'lucide-react';
import { studentsAPI } from '../services/api';
import './Students.css';

const CLASSES = ['CS-301', 'CS-401', 'IT-201', 'IT-301', 'EC-201', 'ME-301', 'CE-201', 'EE-401'];
const TOTAL_PHOTOS = 15; // More photos = higher accuracy

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', uid: '', class: '' });
  const [capturedImages, setCapturedImages] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0); // 3,2,1 before auto-capture
  const [captureProgress, setCaptureProgress] = useState(0); // % during capture
  const webcamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Load students from backend when class filter changes
  useEffect(() => {
    if (!filterClass) return;
    fetchStudents(filterClass);
  }, [filterClass]);

  const fetchStudents = async (className) => {
    setLoading(true);
    try {
      const res = await studentsAPI.getAll(className);
      // Map backend field 'className' to 'class' for consistency
      const mapped = (res.data || []).map(s => ({ ...s, class: s.className || s.class }));
      setStudents(mapped);
    } catch {
      // demo fallback with a few placeholder students
      setStudents([
        { id: 1, uid: 'CS21001', name: 'Aarav Sharma', class: filterClass, faceCount: 15, faceTrained: true },
        { id: 2, uid: 'CS21002', name: 'Priya Patel',  class: filterClass, faceCount: 15, faceTrained: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.uid.toLowerCase().includes(q);
  });

  const openModal = () => {
    setStep(1);
    setForm({ name: '', uid: '', class: '' });
    setCapturedImages([]);
    setCameraActive(false);
    setCapturing(false);
    setCountdown(0);
    setCaptureProgress(0);
    setShowModal(true);
  };

  const closeModal = () => {
    clearInterval(captureIntervalRef.current);
    clearInterval(countdownRef.current);
    setCapturing(false);
    setCameraActive(false);
    setShowModal(false);
  };

  const handleInfoNext = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.uid.trim() || !form.class) {
      toast.error('Please fill all fields');
      return;
    }
    setStep(2);
    setCapturedImages([]);
    // Camera opens, then auto-countdown starts
    setTimeout(() => {
      setCameraActive(true);
      startCountdown();
    }, 600);
  };

  // 3-2-1 countdown, then start auto capture
  const startCountdown = () => {
    setCountdown(3);
    let c = 3;
    countdownRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countdownRef.current);
        beginAutoCapture();
      }
    }, 1000);
  };

  // Capture TOTAL_PHOTOS images with slight delay between each for variety
  const beginAutoCapture = useCallback(() => {
    setCapturing(true);
    setCaptureProgress(0);
    let captured = 0;
    const images = [];

    captureIntervalRef.current = setInterval(() => {
      if (!webcamRef.current) return;
      // Higher quality screenshot
      const img = webcamRef.current.getScreenshot({
        width: 640, height: 480
      });
      if (img) {
        images.push(img);
        captured++;
        setCapturedImages([...images]);
        setCaptureProgress(Math.round((captured / TOTAL_PHOTOS) * 100));

        if (captured >= TOTAL_PHOTOS) {
          clearInterval(captureIntervalRef.current);
          setCapturing(false);
          toast.success(`✅ ${TOTAL_PHOTOS} face photos captured! Ready to register.`);
        }
      }
    }, 700); // 700ms between shots — enough time for slight pose variation
  }, []);

  // Manual retake
  const retakePhotos = () => {
    clearInterval(captureIntervalRef.current);
    clearInterval(countdownRef.current);
    setCapturing(false);
    setCapturedImages([]);
    setCaptureProgress(0);
    startCountdown();
  };

  const handleRegister = async () => {
    if (capturedImages.length < TOTAL_PHOTOS) {
      toast.error(`Need ${TOTAL_PHOTOS} photos. Have ${capturedImages.length}.`);
      return;
    }
    const toastId = toast.loading('Registering student...');
    try {
      // Step 1: create student record
      const res = await studentsAPI.register({
        name: form.name,
        uid: form.uid,
        className: form.class,
      });
      const uid = res.data.uid;

      // Step 2: upload face images as multipart
      const formData = new FormData();
      for (let i = 0; i < capturedImages.length; i++) {
        const blob = await dataURLtoBlob(capturedImages[i]);
        formData.append('images', blob, `face_${i + 1}.jpg`);
      }
      await studentsAPI.uploadFaceImages(uid, formData);

      toast.success(`${form.name} registered with face data!`, { id: toastId });
      closeModal();
      if (filterClass === form.class) fetchStudents(filterClass);
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        (status === 401 ? 'Session expired. Please login again.' : null) ||
        (status === 403 ? 'You are not authorized for this action. Please login again.' : null) ||
        (!err?.response && err?.request ? 'Cannot reach backend. Check if Spring Boot is running on port 8080.' : null) ||
        err?.message ||
        'Student registration failed';
      toast.error(msg, { id: toastId });
    }
  };

  const handleDelete = async (uid, name) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    try {
      await studentsAPI.delete(uid);
    } catch { /* demo */ }
    setStudents(prev => prev.filter(s => s.uid !== uid));
    toast.success(`${name} removed`);
  };

  // Convert base64 dataURL to Blob for multipart upload
  const dataURLtoBlob = (dataURL) => new Promise(resolve => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    resolve(new Blob([u8arr], { type: mime }));
  });

  return (
    <div className="students-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">
            {filterClass
              ? `${filtered.length} student${filtered.length !== 1 ? 's' : ''} in ${filterClass}`
              : 'Select a class to view students'}
          </p>
        </div>
        <button id="register-student-btn" className="btn btn-primary" onClick={openModal}>
          <Plus size={16} /> Register Student
        </button>
      </div>

      {/* Class Filter */}
      <div className="students-filters">
        <select
          className="form-select"
          style={{ minWidth: 200 }}
          value={filterClass}
          onChange={e => { setFilterClass(e.target.value); setSearch(''); }}
          id="class-filter"
        >
          <option value="">— Select a Class —</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {filterClass && (
          <div className="input-wrapper" style={{ flex: 1 }}>
            <div className="input-icon"><Search size={15} /></div>
            <input
              id="student-search"
              className="form-input auth-input"
              placeholder="Search by name or UID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Table or prompts */}
      {!filterClass ? (
        <div className="students-no-class-prompt">
          <div className="students-no-class-prompt__icon"><Users size={32} /></div>
          <h3>Select a Class to View Students</h3>
          <p>Choose a class from the dropdown above to see registered students.</p>
        </div>
      ) : loading ? (
        <div className="empty-state">
          <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p>Loading students...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No students in {filterClass}</h3>
          <p>Register a student to get started.</p>
        </div>
      ) : (
        <motion.div className="table-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>UID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Face Photos</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s.id || s.uid} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td><code style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>{s.uid}</code></td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td><span className="badge badge-info">{s.class || s.className}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 4, maxWidth: 80 }}>
                        <div style={{ height: '100%', background: 'var(--accent-blue)', borderRadius: 4,
                          width: `${Math.min(100, ((s.faceCount || 0) / TOTAL_PHOTOS) * 100)}%` }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.faceCount || 0}/{TOTAL_PHOTOS}</span>
                    </div>
                  </td>
                  <td>
                    {(s.faceTrained || s.faceCount >= TOTAL_PHOTOS)
                      ? <span className="badge badge-success">✓ Trained</span>
                      : <span className="badge badge-warning">Pending</span>}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}
                      onClick={() => handleDelete(s.uid, s.name)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Register Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && closeModal()}>
            <motion.div className="modal" initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ maxWidth: step === 2 ? 580 : 460 }}>

              <div className="modal-header">
                <h2 className="modal-title">
                  {step === 1 ? '👤 Student Information' : '📸 Face Capture'}
                </h2>
                <button className="modal-close" onClick={closeModal}><X size={18} /></button>
              </div>

              {/* Step Indicator */}
              <div className="step-indicator">
                <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                <div className="step-line" />
                <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
              </div>

              {/* Step 1 — Info */}
              {step === 1 && (
                <form onSubmit={handleInfoNext} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input id="student-name" className="form-input" placeholder="e.g. Aarav Sharma"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Student UID</label>
                    <input id="student-uid" className="form-input" placeholder="e.g. CS21001"
                      value={form.uid} onChange={e => setForm({ ...form, uid: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Class</label>
                    <select id="student-class" className="form-select" value={form.class}
                      onChange={e => setForm({ ...form, class: e.target.value })}>
                      <option value="">Select Class</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                    Next — Capture Face Photos <Camera size={16} />
                  </button>
                </form>
              )}

              {/* Step 2 — Auto Face Capture */}
              {step === 2 && (
                <div className="face-capture">
                  {/* Status bar */}
                  <div className="face-capture__info">
                    <span className="badge badge-info">{form.name} · {form.uid} · {form.class}</span>
                    <span className={`badge ${capturedImages.length >= TOTAL_PHOTOS ? 'badge-success' : capturing ? 'badge-warning' : 'badge-info'}`}>
                      {capturedImages.length}/{TOTAL_PHOTOS} photos
                    </span>
                  </div>

                  {/* Guidance tip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)',
                    background: 'rgba(0,168,255,0.07)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', marginBottom: 8 }}>
                    <AlertCircle size={13} color="var(--accent-blue)" />
                    Face the camera directly · Good lighting · Keep still during capture
                  </div>

                  {/* Camera */}
                  <div className="face-capture__camera" style={{ position: 'relative' }}>
                    {cameraActive && (
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        screenshotQuality={0.92}
                        style={{ width: '100%', borderRadius: 12, border: '2px solid var(--border-accent)', display: 'block' }}
                        videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
                        mirrored={true}
                      />
                    )}

                    {/* Countdown overlay */}
                    {countdown > 0 && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', background: 'rgba(0,0,0,0.55)', borderRadius: 12, zIndex: 10 }}>
                        <div style={{ fontSize: 72, fontWeight: 900, color: 'var(--accent-blue)',
                          textShadow: '0 0 30px rgba(0,168,255,0.8)' }}>{countdown}</div>
                      </div>
                    )}

                    {/* Capture flash effect */}
                    {capturing && (
                      <div style={{ position: 'absolute', inset: 0, border: '3px solid var(--accent-blue)',
                        borderRadius: 12, animation: 'glow-pulse 0.7s infinite', pointerEvents: 'none' }} />
                    )}

                    {/* Face guide overlay — corners */}
                    <div className="face-capture__scan-overlay">
                      <div className="face-capture__corner face-capture__corner--tl" />
                      <div className="face-capture__corner face-capture__corner--tr" />
                      <div className="face-capture__corner face-capture__corner--bl" />
                      <div className="face-capture__corner face-capture__corner--br" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  {(capturing || capturedImages.length > 0) && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem',
                        color: 'var(--text-muted)', marginBottom: 4 }}>
                        <span>{capturing ? `Capturing... ${capturedImages.length}/${TOTAL_PHOTOS}` : 'Capture complete'}</span>
                        <span>{captureProgress}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 4 }}>
                        <div style={{ height: '100%', background: 'var(--accent-blue)', borderRadius: 4,
                          width: `${captureProgress}%`, transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {!capturing && capturedImages.length > 0 && capturedImages.length < TOTAL_PHOTOS && (
                      <button className="btn btn-outline btn-sm" onClick={retakePhotos}>
                        ↺ Retake
                      </button>
                    )}
                    {capturedImages.length >= TOTAL_PHOTOS && (
                      <button className="btn btn-ghost btn-sm" onClick={retakePhotos}>
                        ↺ Retake Photos
                      </button>
                    )}
                  </div>

                  {/* Thumbnails row */}
                  {capturedImages.length > 0 && (
                    <div className="face-capture__thumbs">
                      {capturedImages.slice(-6).map((img, i) => (
                        <img key={i} src={img} alt={`face-${i}`} className="face-thumb" />
                      ))}
                      {capturedImages.length > 6 && (
                        <div className="face-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
                          +{capturedImages.length - 6}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Register button */}
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                    disabled={capturedImages.length < TOTAL_PHOTOS || capturing}
                    onClick={handleRegister}
                  >
                    <CheckCircle size={16} />
                    {capturing
                      ? 'Please wait — capturing...'
                      : capturedImages.length < TOTAL_PHOTOS
                      ? `Waiting for ${TOTAL_PHOTOS - capturedImages.length} more photos...`
                      : 'Register Student Now'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;
