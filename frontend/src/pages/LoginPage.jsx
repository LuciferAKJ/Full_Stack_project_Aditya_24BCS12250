import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './AuthPage.css';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const userData = res.data.user;
      const token = res.data.token;
      login(userData, token);
      toast.success(`Welcome back, ${userData.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__grid" />
      </div>

      <div className="auth-wrapper">
        <motion.div className="auth-brand" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon"><Brain size={22} /></div>
            <span>Attend<span className="gradient-text">AI</span></span>
          </Link>
          <p className="auth-brand__sub">Smart Attendance System</p>
        </motion.div>
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="auth-card__header">
            <div className="auth-card__icon">
              <LogIn size={22} />
            </div>
            <h1 className="auth-card__title">Welcome Back</h1>
            <p className="auth-card__subtitle">Sign in to manage your attendance sessions</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <div className="input-icon"><Mail size={16} /></div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="form-input auth-input"
                  placeholder="teacher@college.edu"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <div className="input-icon"><Lock size={16} /></div>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  id="password"
                  className="form-input auth-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Register here</Link></p>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
