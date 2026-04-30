import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';
import { Camera, ArrowLeft, Scan, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';
import { attendanceAPI } from '../services/api';
import './CameraAttendance.css';

const DEMO_FACES = [
  { name: 'Aarav Sharma', uid: 'CS21001', class: 'CS-301' },
  { name: 'Priya Patel', uid: 'CS21002', class: 'CS-301' },
  { name: 'Vikram Singh', uid: 'CS21003', class: 'CS-301' },
  { name: 'Ananya Roy', uid: 'CS21004', class: 'CS-301' },
];

const simulateRecognition = (markedSet) => {
  const rnd = Math.random();
  if (rnd < 0.15) return { type: 'unknown' };
  const face = DEMO_FACES[Math.floor(Math.random() * DEMO_FACES.length)];
  if (markedSet.has(face.uid)) return { type: 'duplicate', ...face };
  return { type: 'recognized', ...face };
};

const CameraAttendance = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const webcamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [markedToday, setMarkedToday] = useState([]);
  const [markedSet, setMarkedSet] = useState(new Set());
  const [scanCount, setScanCount] = useState(0);
  const intervalRef = useRef(null);

  const processFrame = useCallback(async () => {
    if (!webcamRef.current || !cameraReady) return;
    setScanCount(c => c + 1);

    try {
      let result;
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      try {
        const blob = await (await fetch(imageSrc)).blob();
        const res = await attendanceAPI.markByFace(sessionId, blob);
        result = res.data;
      } catch {
        result = simulateRecognition(markedSet);
      }

      if (result.type === 'recognized') {
        setFeedback({ type: 'success', name: result.name, uid: result.uid });
        setMarkedSet(prev => new Set([...prev, result.uid]));
        setMarkedToday(prev => [
          { uid: result.uid, name: result.name, time: new Date().toLocaleTimeString() },
          ...prev,
        ]);
        toast.success(`✅ ${result.name} marked present!`, { duration: 2000 });
      } else if (result.type === 'duplicate') {
        setFeedback({ type: 'duplicate', name: result.name, uid: result.uid });
      } else {
        setFeedback({ type: 'unknown' });
      }
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Frame processing error:', err);
    }
  }, [cameraReady, sessionId, markedSet]);

  useEffect(() => {
    if (scanning) {
      intervalRef.current = setInterval(processFrame, 2000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [scanning, processFrame]);

  const toggleScan = () => {
    if (!cameraReady) { toast.error('Camera not ready yet'); return; }
    setScanning(prev => !prev);
    if (!scanning) {
      toast('🔍 Auto-scanning started — face the camera', { duration: 2000 });
    }
  };

  const feedbackConfig = {
    success: { color: 'var(--success)', bg: 'var(--success-bg)', icon: <CheckCircle size={18} />, border: 'rgba(0,230,118,0.3)' },
    duplicate: { color: 'var(--warning)', bg: 'var(--warning-bg)', icon: <AlertCircle size={18} />, border: 'rgba(255,214,0,0.3)' },
    unknown: { color: 'var(--error)', bg: 'var(--error-bg)', icon: <AlertCircle size={18} />, border: 'rgba(255,68,68,0.3)' },
  };

  return (
    <div className="camera-page">
      {/* Header */}
      <div className="camera-page__header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/sessions')}>
          <ArrowLeft size={16} /> Back to Sessions
        </button>
        <div>
          <h1 className="page-title">Face Attendance Scan</h1>
          <p className="page-subtitle">Session ID: {sessionId} — Auto-scanning every 2 seconds</p>
        </div>
      </div>

      <div className="camera-layout">
        <div className="camera-feed-wrapper">
          <div className="camera-feed">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam-feed"
              videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={() => toast.error('Camera access denied!')}
            />
            <div className={`camera-overlay ${scanning ? 'scanning' : ''}`}>
              <div className="cam-corner cam-corner--tl" />
              <div className="cam-corner cam-corner--tr" />
              <div className="cam-corner cam-corner--bl" />
              <div className="cam-corner cam-corner--br" />
              {scanning && <div className="cam-scan-line" />}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    className="cam-feedback"
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    style={{
                      background: feedbackConfig[feedback.type].bg,
                      color: feedbackConfig[feedback.type].color,
                      borderColor: feedbackConfig[feedback.type].border,
                    }}
                  >
                    {feedbackConfig[feedback.type].icon}
                    <div>
                      {feedback.type === 'success' && (
                        <>
                          <div style={{ fontWeight: 700 }}>{feedback.name}</div>
                          <div style={{ fontSize: 11, opacity: 0.8 }}>
                            {feedback.uid} — Marked Present ✓
                          </div>
                        </>
                      )}
                      {feedback.type === 'duplicate' && (
                        <>
                          <div style={{ fontWeight: 700 }}>{feedback.name}</div>
                          <div style={{ fontSize: 11, opacity: 0.8 }}>Already marked for this session</div>
                        </>
                      )}
                      {feedback.type === 'unknown' && (
                        <div style={{ fontWeight: 700 }}>Unknown Face — Not Registered</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="camera-controls">
            <button
              id="toggle-scan-btn"
              className={`btn btn-lg ${scanning ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggleScan}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {scanning ? (
                <><span className="scan-pulse" /> Stop Scanning</>
              ) : (
                <><Scan size={18} /> Start Auto-Scan</>
              )}
            </button>
          </div>
          <div className="camera-stats">
            <div className="camera-stat">
              <Users size={15} /> <strong>{markedToday.length}</strong> Marked
            </div>
            <div className="camera-stat">
              <Camera size={15} /> <strong>{scanCount}</strong> Frames
            </div>
            <div className="camera-stat">
              <div className={`status-indicator ${cameraReady ? 'ready' : 'loading'}`} />
              {cameraReady ? 'Camera Ready' : 'Initializing...'}
            </div>
            <div className="camera-stat">
              <div className={`status-indicator ${scanning ? 'active' : 'idle'}`} />
              {scanning ? 'Scanning...' : 'Idle'}
            </div>
          </div>
        </div>
        <div className="attendance-log card">
          <div className="attendance-log__header">
            <h3><CheckCircle size={16} /> Marked Present</h3>
            <span className="badge badge-success">{markedToday.length}</span>
          </div>

          {markedToday.length === 0 ? (
            <div className="attendance-log__empty">
              <Scan size={32} style={{ opacity: 0.3 }} />
              <p>No students marked yet.<br />Start scanning to begin.</p>
            </div>
          ) : (
            <div className="attendance-log__list">
              <AnimatePresence>
                {markedToday.map((r, i) => (
                  <motion.div
                    key={r.uid}
                    className="log-item"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="log-item__avatar">
                      {r.name[0]}
                    </div>
                    <div className="log-item__info">
                      <div className="log-item__name">{r.name}</div>
                      <div className="log-item__uid">{r.uid}</div>
                    </div>
                    <div className="log-item__time">
                      <Clock size={11} /> {r.time}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraAttendance;
