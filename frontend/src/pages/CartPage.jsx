import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import { getImageUrl } from '../utils/imageUtils';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Your Shopping Cart</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          Please log in to view and manage items in your shopping cart.
        </p>
        <Link to="/login" className="btn btn-primary">
          Sign In Now
        </Link>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your Shopping Cart is Empty"
        description="Explore our catalog to find premium electronics, luxury apparel, and modern essentials."
        actionText="Start Shopping"
        actionLink="/"
      />
    );
  }

  const shippingCost = Number(cart.total_price) > 50 ? 0 : 9.99;
  const grandTotal = Number(cart.total_price) + shippingCost;

  return (
    <div className="cart-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
          Shopping Cart ({cart.total_items_count} {cart.total_items_count === 1 ? 'item' : 'items'})
        </h1>
        <button onClick={clearCart} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}>
          <Trash2 size={15} /> Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                padding: '1.25rem',
              }}
            >
              {/* Product Thumbnail */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getImageUrl(item.product?.featured_image) ? (
                  <img
                    src={getImageUrl(item.product?.featured_image)}
                    alt={item.product?.title || 'Product'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Img</span>
                )}
              </div>

              {/* Product Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/product/${item.product?.slug}`}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '0.3rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.product?.title}
                  </h3>
                </Link>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Unit: ${Number(item.unit_price).toFixed(2)}
                </div>
              </div>

              {/* Quantity Adjuster */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  -
                </button>
                <span style={{ fontWeight: 700, padding: '0 0.4rem', fontSize: '0.9rem' }}>
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: '#fff',
                  minWidth: '80px',
                  textAlign: 'right',
                }}
              >
                ${Number(item.subtotal).toFixed(2)}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.4rem',
                }}
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span>${Number(cart.total_price).toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
            <span>Estimated Shipping</span>
            <span>{shippingCost === 0 ? <strong style={{ color: 'var(--success)' }}>FREE</strong> : `$${shippingCost.toFixed(2)}`}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#fff',
            }}
          >
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>${grandTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <ShieldCheck size={16} color="var(--success)" /> 256-Bit Encrypted Secure Checkout
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
