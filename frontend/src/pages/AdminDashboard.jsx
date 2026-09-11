import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, 
  Users, 
  FolderPlus, 
  Package, 
  Layers 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'categories' | 'orders'
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);

  // New Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [submittingCat, setSubmittingCat] = useState(false);

  const { showToast } = useToast();

  const fetchAdminData = async () => {
    try {
      const [usersRes, catRes, orderRes] = await Promise.all([
        axiosClient.get('/api/accounts/admin/users/'),
        axiosClient.get('/api/products/categories/'),
        axiosClient.get('/api/orders/'),
      ]);

      const uData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.results || []);
      const cData = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.results || []);
      const oData = Array.isArray(orderRes.data) ? orderRes.data : (orderRes.data?.results || []);

      setUsers(uData);
      setCategories(cData);
      setOrders(oData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setUsers([]);
      setCategories([]);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await axiosClient.patch(`/api/accounts/admin/users/${userId}/`, { role: newRole });
      showToast(`User role updated to ${newRole}`, 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to update user role.', 'error');
    }
  };

  const handleToggleVerifySeller = async (userId, currentStatus) => {
    try {
      await axiosClient.patch(`/api/accounts/admin/users/${userId}/`, { is_verified_seller: !currentStatus });
      showToast(`Seller verification updated!`, 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to update seller verification.', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosClient.patch(`/api/orders/${orderId}/update_status/`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`, 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to update order status.', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setSubmittingCat(true);
    try {
      await axiosClient.post('/api/products/categories/', {
        name: newCategoryName,
        description: newCategoryDesc,
      });
      showToast('Category created successfully!', 'success');
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategoryDesc('');
      fetchAdminData();
    } catch (err) {
      const msg = err.response?.data?.name?.[0] || 'Failed to create category.';
      showToast(msg, 'error');
    } finally {
      setSubmittingCat(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={28} color="#f472b6" /> Admin Governance Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            System-wide RBAC user permissions, catalog categories, and global order fulfillment
          </p>
        </div>

        {activeTab === 'categories' && (
          <button onClick={() => setIsCategoryModalOpen(true)} className="btn btn-primary">
            <FolderPlus size={18} /> New Category
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={16} /> User Roles & Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`btn btn-sm ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Layers size={16} /> Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Package size={16} /> All Platform Orders ({orders.length})
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username / Email</th>
                <th>Role Assignment</th>
                <th>Seller Verification</th>
                <th>Account Status</th>
                <th>Date Joined</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{u.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', width: '130px' }}
                      value={u.role}
                      onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="SELLER">Seller</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td>
                    {u.role === 'SELLER' ? (
                      <button
                        onClick={() => handleToggleVerifySeller(u.id, u.is_verified_seller)}
                        className={`btn btn-sm ${u.is_verified_seller ? 'btn-success' : 'btn-secondary'}`}
                        style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}
                      >
                        {u.is_verified_seller ? 'Verified ✓' : 'Unverified ✗'}
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-customer' : 'badge-admin'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(u.date_joined).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Category Management */}
      {activeTab === 'categories' && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Listed Products</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(categories) && categories.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{c.name}</td>
                  <td>
                    <code>{c.slug}</code>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '350px' }}>{c.description || '—'}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {c.products_count || 0} products
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Orders Management */}
      {activeTab === 'orders' && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Delivery Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(orders) && orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{o.order_number}</td>
                  <td>{o.customer_username}</td>
                  <td style={{ fontWeight: 700 }}>${Number(o.total_amount).toFixed(2)}</td>
                  <td>
                    <span className="badge badge-customer">{o.payment_status}</span>
                  </td>
                  <td>
                    <span className={`badge badge-status ${o.status}`}>{o.status}</span>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', width: '140px' }}
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Create New Category"
      >
        <form onSubmit={handleCreateCategory}>
          <div className="form-group">
            <label className="input-label">Category Name</label>
            <input
              type="text"
              className="form-control"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              placeholder="e.g. Gaming & VR"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Description (Optional)</label>
            <textarea
              className="form-control"
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)}
              placeholder="Brief summary of items in this category..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingCat}
              className="btn btn-primary"
            >
              {submittingCat ? 'Creating...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
