import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import EmptyState from '../components/EmptyState';
import { Package, Calendar, MapPin, Loader2 } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosClient.get('/api/orders/');
        const data = res.data.results ? res.data.results : res.data;
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <Loader2 size={36} className="spinner-icon" />
        <p>Loading your order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No Orders Placed Yet"
        description="When you place an order, you will be able to track its shipping status and details here."
        actionText="Explore Products"
        actionLink="/"
      />
    );
  }

  return (
    <div className="orders-page">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '2rem' }}>
        My Order History ({orders.length})
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders.map((order) => (
          <div key={order.id} className="card" style={{ padding: '1.75rem' }}>
            {/* Header: Order Number, Date, Status */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Order Identifier
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                  {order.order_number}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <Calendar size={16} />
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>

                <span className={`badge badge-status ${order.status}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.92rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.quantity}x</span>
                    <span>{item.product_title}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>${Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Footer Details: Shipping Address & Grand Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.01)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <MapPin size={15} />
                <span>
                  Delivering to: {order.shipping_full_name}, {order.shipping_city}, {order.shipping_country}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Paid:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ${Number(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
