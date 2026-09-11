import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { Search, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [priceRange, setPriceRange] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get('/api/products/categories/');
        const catData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setCategories(catData);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products with filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category_slug = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (ordering) params.ordering = ordering;
      if (priceRange) {
        const [min, max] = priceRange.split('-');
        if (min) params.min_price = min;
        if (max) params.max_price = max;
      }

      const res = await axiosClient.get('/api/products/items/', { params });
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, ordering, priceRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-section">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
          <Sparkles size={16} /> Curated Multi-Vendor Marketplace
        </div>
        <h1 className="hero-title">Discover Quality Products & Exclusive Tech</h1>
        <p className="hero-subtitle">
          Shop directly from verified creators, top brands, and global merchants with secure JWT transactions.
        </p>

        {/* Live Search in Hero */}
        <div style={{ maxWidth: '520px', margin: '0 auto', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search products, headphones, smart devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.9rem 1rem 0.9rem 3rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-highlight)',
              borderRadius: 'var(--radius-full)',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: 'var(--shadow-md)',
            }}
          />
        </div>
      </section>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setSelectedCategory('')}
          className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          All Categories
        </button>
        {Array.isArray(categories) && categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`btn btn-sm ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter & Sorting Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          <SlidersHorizontal size={18} />
          <span>Showing {products.length} {products.length === 1 ? 'product' : 'products'}</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Price Filter */}
          <select
            className="form-control"
            style={{ width: '160px', padding: '0.5rem 0.8rem', fontSize: '0.88rem' }}
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          >
            <option value="">Any Price</option>
            <option value="0-50">Under $50</option>
            <option value="50-150">$50 to $150</option>
            <option value="150-500">$150 to $500</option>
            <option value="500-">$500 & Above</option>
          </select>

          {/* Sort By */}
          <select
            className="form-control"
            style={{ width: '180px', padding: '0.5rem 0.8rem', fontSize: '0.88rem' }}
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
          >
            <option value="-created_at">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid / Skeletons */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <Loader2 size={36} className="spinner-icon" style={{ margin: '0 auto 1rem' }} />
          <p>Loading curated products...</p>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products match your criteria"
          description="Try adjusting your search terms, changing categories, or clearing price filters."
          actionText="Reset Filters"
          onAction={() => {
            setSelectedCategory('');
            setSearchQuery('');
            setPriceRange('');
            setOrdering('-created_at');
          }}
        />
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
