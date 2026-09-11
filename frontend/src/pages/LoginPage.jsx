import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, User, KeyRound, Sparkles, ShieldCheck, Store, ShoppingBag, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      showToast(`Welcome back, ${res.user.username}!`, 'success');
      navigate(from, { replace: true });
    } else {
      setErrorMessage(res.error);
      showToast(res.error, 'error');
    }
  };

  const handleDemoLogin = async (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setLoading(true);

    const res = await login(demoUser, demoPass);
    setLoading(false);

    if (res.success) {
      showToast(`Signed in as ${res.user.role} (${res.user.username})`, 'success');
      if (res.user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.user.role === 'SELLER') {
        navigate('/seller/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      showToast(res.error, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              background: 'var(--primary-gradient)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Lock size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Account Login</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Access your personalized store dashboard
          </p>
        </div>

        {/* 1-Click Quick Demo Access */}
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.6rem' }}>
            <Sparkles size={14} /> Quick 1-Click Role Logins:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin', 'Admin@123456')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.35rem' }}
            >
              <ShieldCheck size={13} color="#f472b6" /> Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('seller_alex', 'Seller@123456')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.35rem' }}
            >
              <Store size={13} color="#38bdf8" /> Seller
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('customer_jane', 'Customer@123456')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.35rem' }}
            >
              <ShoppingBag size={13} color="#34d399" /> Buyer
            </button>
          </div>
        </div>

        {/* Prominent Error Banner */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={20} color="var(--danger)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.88rem', color: '#fca5a5' }}>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
