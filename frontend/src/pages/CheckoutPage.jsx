import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Truck, CreditCard, Lock, Loader2 } from 'lucide-react';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shipping_full_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || '',
    shipping_phone: user?.phone_number || '',
    shipping_address: user?.address || '',
    shipping_city: user?.city || '',
    shipping_country: user?.country || 'USA',
    shipping_postal_code: user?.postal_code || '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!cart.items || cart.items.length === 0) {
      showToast('Your cart is empty.', 'error');
      navigate('/cart');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosClient.post('/api/orders/', formData);
      showToast(`Order #${res.data.order_number} placed successfully!`, 'success');
      await fetchCart(); // Refresh cart to clear
      navigate('/orders');
    } catch (err) {
      const errorMsg =
        err.response?.data?.cart ||
        err.response?.data?.stock ||
        err.response?.data?.detail ||
        'Failed to process checkout. Please verify your details.';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const shippingCost = Number(cart.total_price) > 50 ? 0 : 9.99;
  const grandTotal = Number(cart.total_price) + shippingCost;

  return (
    <div className="checkout-page">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '2rem' }}>
        Complete Your Order
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Shipping Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', color: '#fff' }}>
            <Truck size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Shipping & Delivery Address</h2>
          </div>

          <form onSubmit={handleSubmitOrder}>
            <div className="form-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                name="shipping_full_name"
                className="form-control"
                value={formData.shipping_full_name}
                onChange={handleChange}
                required
                placeholder="e.g. Jane Doe"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="text"
                  name="shipping_phone"
                  className="form-control"
                  value={formData.shipping_phone}
                  onChange={handleChange}
                  required
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Postal / Zip Code</label>
                <input
                  type="text"
                  name="shipping_postal_code"
                  className="form-control"
                  value={formData.shipping_postal_code}
                  onChange={handleChange}
                  required
                  placeholder="97477"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Street Address</label>
              <textarea
                name="shipping_address"
                className="form-control"
                value={formData.shipping_address}
                onChange={handleChange}
                required
                style={{ minHeight: '80px' }}
                placeholder="Apartment, suite, unit, building, street"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="input-label">City</label>
                <input
                  type="text"
                  name="shipping_city"
                  className="form-control"
                  value={formData.shipping_city}
                  onChange={handleChange}
                  required
                  placeholder="San Francisco"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Country</label>
                <input
                  type="text"
                  name="shipping_country"
                  className="form-control"
                  value={formData.shipping_country}
                  onChange={handleChange}
                  required
                  placeholder="USA"
                />
              </div>
            </div>

            {/* Payment Info Demo Box */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                margin: '1.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
              }}
            >
              <CreditCard size={22} color="var(--primary)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                  Demo Payment Gateway
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Automatic payment processing enabled for this sandbox transaction.
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="spinner-icon" /> Processing Secure Order...
                </>
              ) : (
                <>
                  <Lock size={18} /> Place Order & Pay ${grandTotal.toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Items Preview */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>
            Items in Order ({cart.items?.length || 0})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            {cart.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.quantity}x</span>
                  <span style={{ color: '#fff', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product?.title}
                  </span>
                </div>
                <span style={{ fontWeight: 600, color: '#fff' }}>${Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span>Subtotal</span>
              <span>${Number(cart.total_price).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span>Delivery</span>
              <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', color: '#fff', marginTop: '0.5rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
