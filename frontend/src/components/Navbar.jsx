import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl } from '../utils/imageUtils';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Heart,
  User, 
  LogOut, 
  Package, 
  ShieldCheck, 
  Store, 
  ChevronDown 
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isSeller, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const userAvatarUrl = getImageUrl(user?.profile_image);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <ShoppingBag size={20} color="#fff" />
          </div>
          <span>NovaStore</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Shop Catalog
          </NavLink>

          {isSeller && (
            <NavLink to="/seller/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Store size={16} />
              Seller Hub
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={16} />
              Admin Portal
            </NavLink>
          )}
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Wishlist Button */}
          <Link to="/wishlist" className="cart-nav-btn" aria-label="Wishlist" title="My Wishlist">
            <Heart size={20} color={wishlistCount > 0 ? '#ef4444' : 'currentColor'} fill={wishlistCount > 0 ? '#ef4444' : 'none'} />
            {wishlistCount > 0 && (
              <span className="cart-count-badge" style={{ background: '#ef4444' }}>
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Cart Button */}
          <Link to="/cart" className="cart-nav-btn" aria-label="Shopping Cart" title="Shopping Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
          </Link>

          {/* User Profile / Auth State */}
          {isAuthenticated ? (
            <div className="user-menu-wrapper" ref={dropdownRef}>
              <button
                className="user-profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                style={{ padding: '0.35rem 0.6rem 0.35rem 0.35rem' }}
              >
                <div className="user-avatar-placeholder" style={{ width: '32px', height: '32px', overflow: 'hidden' }}>
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt={user?.username}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    user?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user?.username}</span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-user-name">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                    </div>
                    <div className="dropdown-user-role">
                      <span className={`badge badge-${user?.role?.toLowerCase()}`}>
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} />
                    My Profile & Photo
                  </Link>

                  <Link
                    to="/wishlist"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Heart size={16} color="#ef4444" />
                    My Wishlist ({wishlistCount})
                  </Link>

                  <Link
                    to="/orders"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Package size={16} />
                    My Orders
                  </Link>

                  {isSeller && (
                    <Link
                      to="/seller/dashboard"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Store size={16} />
                      Seller Dashboard
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <ShieldCheck size={16} />
                      Admin Dashboard
                    </Link>
                  )}

                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

