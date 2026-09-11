import { ShoppingBag, Shield, Truck, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Value Propositions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
              <Truck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Fast Global Shipping</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Free delivery on orders over $50</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
              <Shield size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Secure JWT Protection</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Role-based enterprise security</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
              <RotateCcw size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>30-Day Easy Returns</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Hassle-free money back policy</div>
            </div>
          </div>
        </div>

        {/* Footer Top info */}
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-logo">
              <div className="brand-icon">
                <ShoppingBag size={20} color="#fff" />
              </div>
              <span>NovaStore</span>
            </div>
            <p>
              Next-generation e-commerce platform with multi-vendor marketplace capabilities and secure role-based management.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.8rem' }}>Marketplace</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Link to="/">All Products</Link>
                <Link to="/seller/dashboard">Become a Seller</Link>
                <Link to="/orders">Track Orders</Link>
              </div>
            </div>

            <div>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.8rem' }}>Account</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Link to="/profile">My Profile</Link>
                <Link to="/cart">Shopping Cart</Link>
                <Link to="/login">Sign In</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} NovaStore Inc. Built with Django REST Framework & React.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
