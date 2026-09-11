import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, Store, ShoppingBag, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const [role, setRole] = useState('CUSTOMER');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    city: '',
    country: 'USA',
    postal_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    if (formData.password !== formData.password_confirm) {
      const err = 'Passwords do not match. Please ensure both passwords are identical.';
      setErrorMessage(err);
      setFieldErrors({ password_confirm: ['Passwords do not match.'] });
      showToast(err, 'error');
      return;
    }

    if (formData.password.length < 6) {
      const err = 'Password is too short. It must contain at least 6 characters.';
      setErrorMessage(err);
      setFieldErrors({ password: [err] });
      showToast(err, 'error');
      return;
    }

    setLoading(true);
    const payload = { ...formData, role };
    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      showToast(`Welcome, ${res.user.username}! Your ${role.toLowerCase()} account has been created.`, 'success');
      if (role === 'SELLER') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setErrorMessage(res.error);
      setFieldErrors(res.fieldErrors || {});
      showToast(res.error, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '580px', margin: '2rem auto', padding: '0 1rem' }}>
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
            <UserPlus size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Join NovaStore</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Choose your account role and start browsing or selling
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`btn ${role === 'CUSTOMER' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.85rem' }}
          >
            <ShoppingBag size={18} /> Customer (Buyer)
          </button>
          <button
            type="button"
            onClick={() => setRole('SELLER')}
            className={`btn ${role === 'SELLER' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.85rem' }}
          >
            <Store size={18} /> Merchant (Seller)
          </button>
        </div>

        {/* Prominent Error Banner */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.88rem', color: '#fca5a5', lineHeight: 1.5 }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '0.2rem' }}>
                Registration Error:
              </strong>
              {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Username *</label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="john_doe"
                value={formData.username}
                onChange={handleChange}
                required
                style={{ borderColor: fieldErrors?.username ? 'var(--danger)' : undefined }}
              />
              {fieldErrors?.username && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
                  {Array.isArray(fieldErrors.username) ? fieldErrors.username[0] : fieldErrors.username}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ borderColor: fieldErrors?.email ? 'var(--danger)' : undefined }}
              />
              {fieldErrors?.email && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
                  {Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">First Name</label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                style={{ borderColor: fieldErrors?.password ? 'var(--danger)' : undefined }}
              />
              {fieldErrors?.password && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
                  {Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">Confirm Password *</label>
              <input
                type="password"
                name="password_confirm"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.password_confirm}
                onChange={handleChange}
                required
                minLength={6}
                style={{ borderColor: fieldErrors?.password_confirm ? 'var(--danger)' : undefined }}
              />
              {fieldErrors?.password_confirm && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
                  {Array.isArray(fieldErrors.password_confirm) ? fieldErrors.password_confirm[0] : fieldErrors.password_confirm}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              className="form-control"
              placeholder="+1 555-0199"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Address</label>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="123 Market St, Suite 400"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">City</label>
              <input
                type="text"
                name="city"
                className="form-control"
                placeholder="San Francisco"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Postal Code</label>
              <input
                type="text"
                name="postal_code"
                className="form-control"
                placeholder="94103"
                value={formData.postal_code}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'SELLER' ? 'Seller' : 'Customer'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
