import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera, FileSpreadsheet, Shield, Users,
  CheckCircle, ArrowRight, Clock,
  GraduationCap, BookOpen, BarChart2, Fingerprint
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './LandingPage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const features = [
  {
    icon: <Camera size={22} />,
    title: 'Auto Face Detection',
    desc: 'Camera scans automatically — no button clicking. Students just walk in and attendance is marked.',
  },
  {
    icon: <Shield size={22} />,
    title: 'No Proxy Attendance',
    desc: 'Face recognition ensures only the actual student can mark attendance. Fraud is physically impossible.',
  },
  {
    icon: <FileSpreadsheet size={22} />,
    title: 'Excel Export',
    desc: 'Export class-wise attendance to a ready-to-upload Excel sheet for college portals in one click.',
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Session Dashboard',
    desc: 'See per-session attendees, absentees, and progress at a glance from the admin dashboard.',
  },
  {
    icon: <BookOpen size={22} />,
    title: 'Class-Wise Records',
    desc: 'All records organized by class and date. Filter, search, and review attendance any time.',
  },
  {
    icon: <Fingerprint size={22} />,
    title: 'High Accuracy LBPH',
    desc: 'Built on OpenCV LBPH + Haar Cascade — a proven, efficient algorithm tuned for indoor classroom conditions.',
  },
];

const steps = [
  { num: 1, title: 'Teacher Logs In', desc: 'Secure account with your registered email and password.' },
  { num: 2, title: 'Create a Session', desc: 'Select your class and today\'s time slot — takes 5 seconds.' },
  { num: 3, title: 'Camera Activates', desc: 'Webcam opens automatically and starts scanning for faces.' },
  { num: 4, title: 'Faces Recognized', desc: 'Registered faces are matched. Unknown or absent students flagged.' },
  { num: 5, title: 'Records Stored', desc: 'Each present student\'s record is saved with a timestamp.' },
  { num: 6, title: 'Export & Done', desc: 'Download the Excel sheet for your college records portal.' },
];

const stats = [
  { value: '< 1 sec', label: 'Per student scan' },
  { value: '98%+', label: 'Recognition accuracy' },
  { value: '0 clicks', label: 'Manual roll calls' },
  { value: '8 slots', label: 'Pre-set time periods' },
];

const timeSlots = [
  '09:30 – 10:20 AM', '10:20 – 11:10 AM', '11:20 – 12:10 PM', '12:10 – 1:00 PM',
  '1:05 – 1:55 PM', '1:55 – 2:45 PM', '2:45 – 3:35 PM', '3:35 – 4:25 PM',
];

const LandingPage = () => {
  return (
    <div className="landing">
      <Navbar variant="landing" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__bg-blob hero__bg-blob--1" />
          <div className="hero__bg-blob hero__bg-blob--2" />
        </div>
        <div className="container hero__content">
          <div className="hero__left">
            <motion.div className="hero__eyebrow" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <span className="hero__eyebrow-dot" />
              Built for Indian College Classrooms
            </motion.div>

            <motion.h1 className="hero__title" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
              Take Attendance in Seconds,<br />
              <span className="hero__title-accent">Not Minutes</span>
            </motion.h1>

            <motion.p className="hero__subtitle" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
              AttendAI uses your laptop's webcam to automatically recognize
              registered students and mark their attendance — no paper, no roll call,
              no proxy. Just open the camera and walk in.
            </motion.p>

            <motion.div className="hero__actions" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Teacher Login
              </Link>
            </motion.div>

            <motion.div className="hero__checks" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
              {['Free to use', 'Works offline', 'No proxy attendance'].map(t => (
                <span key={t} className="hero__check">
                  <CheckCircle size={14} color="var(--success)" /> {t}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div className="hero__right" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}>
            <div className="hero__card">
              <div className="hero__card-header">
                <div className="hero__card-dot hero__card-dot--green" />
                <div className="hero__card-dot hero__card-dot--yellow" />
                <div className="hero__card-dot hero__card-dot--red" />
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  CS-301 · 9:30 AM
                </span>
              </div>
              <div className="hero__card-body">
                <div className="hero__camera-frame">
                  <div className="hero__camera-face">
                    <div className="hero__camera-face-oval" />
                    <div className="hero__camera-eyes">
                      <div className="hero__camera-eye" />
                      <div className="hero__camera-eye" />
                    </div>
                    <div className="hero__camera-mouth" />
                  </div>
                  <div className="hero__camera-corners">
                    <span /><span /><span /><span />
                  </div>
                  <div className="hero__camera-scanline" />
                </div>
                <div className="hero__scan-result">
                  <CheckCircle size={16} color="var(--success)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Aarav Sharma</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CS21001 · Present · 9:32 AM</div>
                  </div>
                </div>
                <div className="hero__attendance-list">
                  {[
                    { name: 'Priya Patel',  uid: 'CS21002', time: '9:33' },
                    { name: 'Rohit Mehta',  uid: 'CS21003', time: '9:34' },
                    { name: 'Sneha Gupta',  uid: 'CS21004', time: '9:35' },
                  ].map(s => (
                    <div key={s.uid} className="hero__attendance-row">
                      <div className="hero__attendance-avatar">{s.name[0]}</div>
                      <div style={{ flex: 1, fontSize: '0.8rem' }}>{s.name}</div>
                      <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>✓ {s.time}</span>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: 4 }}>
                  4 present · 1 absent · Session active
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="stats-bar">
        <div className="container stats-bar__inner">
          {stats.map((s, i) => (
            <motion.div key={i} className="stats-bar__item" variants={fadeUp}
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.08}>
              <div className="stats-bar__value">{s.value}</div>
              <div className="stats-bar__label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="section features" id="features">
        <div className="container">
          <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="section-tag">Features</div>
            <h2 className="section-title">Everything a Teacher Needs</h2>
            <p className="section-desc">
              Designed for simplicity. From face registration to Excel export — no tech skills needed.
            </p>
          </motion.div>
          <div className="features__grid">
            {features.map((f, i) => (
              <motion.div key={i} className="feature-card" variants={fadeUp}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.07}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="section-tag">How It Works</div>
            <h2 className="section-title">Six Steps, Zero Hassle</h2>
            <p className="section-desc">From login to attendance report — all in under 2 minutes.</p>
          </motion.div>
          <div className="steps__grid">
            {steps.map((s, i) => (
              <motion.div key={i} className="step-card" variants={fadeUp}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.07}>
                <div className="step-card__num">{String(s.num).padStart(2, '0')}</div>
                <h3 className="step-card__title">{s.title}</h3>
                <p className="step-card__desc">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Time Slots ───────────────────────────────────────── */}
      <section className="section timeslots">
        <div className="container">
          <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="section-tag">Schedule</div>
            <h2 className="section-title">College Time Slots</h2>
            <p className="section-desc">Pre-configured with standard lecture periods. Just pick your slot.</p>
          </motion.div>
          <div className="timeslots__grid">
            {timeSlots.map((slot, i) => (
              <motion.div key={i} className="timeslot-card" variants={fadeUp}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.06}>
                <div className="timeslot-card__period">Period {i + 1}</div>
                <div className="timeslot-card__time">
                  <Clock size={13} /> {slot}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="section cta-banner">
        <div className="container">
          <motion.div className="cta-banner__inner" variants={fadeUp}
            initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <GraduationCap size={36} style={{ color: 'var(--accent-blue)', marginBottom: 16 }} />
            <h2 className="cta-banner__title">Ready to Try It?</h2>
            <p className="cta-banner__desc">
              Register your account, enroll your students with their face photos,
              and start your first automated attendance session today.
            </p>
            <div className="cta-banner__actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Account <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">Already have one? Login</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1.1rem' }}>
              <Camera size={18} color="var(--accent-blue)" /> AttendAI
            </div>
            <p>Smart attendance for modern classrooms.</p>
          </div>
          <div className="footer__links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
        <div className="footer__copy">
          <div className="container">© 2026 AttendAI — Built for academic excellence</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
