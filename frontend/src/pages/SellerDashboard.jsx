import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../utils/imageUtils';
import { 
  Plus, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  Edit3, 
  Trash2, 
  Layers,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'

  // Modal State for Add / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '',
    is_active: true,
  });

  const { showToast } = useToast();

  const fetchSellerData = async () => {
    try {
      const [prodRes, orderRes, catRes] = await Promise.all([
        axiosClient.get('/api/products/items/my_products/'),
        axiosClient.get('/api/orders/seller_orders/'),
        axiosClient.get('/api/products/categories/'),
      ]);

      const prodData = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.results || []);
      const orderData = Array.isArray(orderRes.data) ? orderRes.data : (orderRes.data?.results || []);
      const catData = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.results || []);

      setProducts(prodData);
      setSoldItems(orderData);
      setCategories(catData);
    } catch (err) {
      console.error('Failed to load seller data:', err);
      setProducts([]);
      setSoldItems([]);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setForm({
      title: '',
      category: categories[0]?.id || '',
      description: '',
      price: '',
      discount_price: '',
      stock: '10',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setSelectedFile(null);
    setPreviewUrl(getImageUrl(product.featured_image));
    setForm({
      title: product.title,
      category: product.category?.id || '',
      description: product.description || '',
      price: product.price,
      discount_price: product.discount_price || '',
      stock: product.stock,
      is_active: product.is_active,
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteProduct = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axiosClient.delete(`/api/products/items/${slug}/`);
      showToast('Product deleted successfully.', 'info');
      fetchSellerData();
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let savedProductSlug = null;
      if (editingProduct) {
        const res = await axiosClient.patch(`/api/products/items/${editingProduct.slug}/`, form);
        savedProductSlug = res.data?.slug || editingProduct.slug;
        showToast('Product updated successfully!', 'success');
      } else {
        const res = await axiosClient.post('/api/products/items/', form);
        savedProductSlug = res.data?.slug;
        showToast('New product created successfully!', 'success');
      }

      // If user provided a photo, upload it now
      if (selectedFile && savedProductSlug) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('is_featured', 'true');
        await axiosClient.post(`/api/products/items/${savedProductSlug}/upload_image/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsModalOpen(false);
      fetchSellerData();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.title?.[0] || 'Failed to save product.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalRevenue = soldItems.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);

  return (
    <div className="seller-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Seller Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage your catalog inventory and customer order shipments
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Listed Products</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{products.length}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Items Sold</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{soldItems.length}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Sales Revenue</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>${totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`btn btn-sm ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Layers size={16} /> Inventory Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ShoppingBag size={16} /> Customer Orders ({soldItems.length})
        </button>
      </div>

      {/* Tab 1: Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    You haven't listed any products yet. Click "Add New Product" to get started!
                  </td>
                </tr>
              ) : (
                Array.isArray(products) && products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-elevated)',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {getImageUrl(p.featured_image) ? (
                            <img src={getImageUrl(p.featured_image)} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <ImageIcon size={18} style={{ opacity: 0.4 }} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{p.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Slug: {p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category?.name || 'Uncategorized'}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>${Number(p.price).toFixed(2)}</span>
                      {p.discount_price && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          (Sale: ${Number(p.discount_price).toFixed(2)})
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: p.stock > 0 ? 'var(--text-primary)' : 'var(--danger)', fontWeight: 600 }}>
                        {p.stock} units
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.is_active ? 'badge-customer' : 'badge-admin'}`}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>★ {p.average_rating || 0} ({p.review_count || 0})</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="btn btn-secondary btn-icon-only"
                          title="Edit Product"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.slug)}
                          className="btn btn-secondary btn-icon-only"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Sold Items */}
      {activeTab === 'orders' && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Title</th>
                <th>Quantity Sold</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {soldItems.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No orders have been placed for your products yet.
                  </td>
                </tr>
              ) : (
                Array.isArray(soldItems) && soldItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{item.product_title}</td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.price).toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${Number(item.subtotal).toFixed(2)}</td>
                    <td>
                      <span className="badge badge-customer">Fulfillment Ready</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Create New Product'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="input-label">Product Title</label>
            <input
              type="text"
              className="form-control"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Ultra HD Noise Cancelling Headphones"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Category</label>
              <select
                className="form-control"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {Array.isArray(categories) && categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Inventory Stock</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Regular Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                placeholder="199.99"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Discount Price ($ Optional)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                value={form.discount_price}
                onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
                placeholder="149.99"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Detailed Description</label>
            <textarea
              className="form-control"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              placeholder="Highlight features, specifications, and warranty..."
            />
          </div>

          <div className="form-group">
            <label className="input-label">Product Photo / Image</label>
            <div style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'center',
              background: 'var(--bg-elevated)',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              {previewUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>Image Selected</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Click or drag to replace image</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <UploadCloud size={28} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Click or drag image file here to upload
                  </span>
                  <span style={{ fontSize: '0.78rem' }}>PNG, JPG, JPEG, WEBP up to 5MB</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SellerDashboard;
