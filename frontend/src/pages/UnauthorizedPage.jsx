import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1.5rem', maxWidth: '540px', margin: '0 auto' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}
      >
        <ShieldAlert size={36} />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.8rem' }}>
        403 - Access Denied
      </h1>

      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        You do not have the required Role-Based Access permissions to access this administrative or merchant portal.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Store Catalog
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
