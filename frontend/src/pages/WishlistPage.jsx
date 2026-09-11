import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';
import RatingStars from '../components/RatingStars';
import EmptyState from '../components/EmptyState';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Check, 
  Loader2, 
  ArrowRight,
  ImageOff
} from 'lucide-react';

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());

  const handleAddToCart = async (product) => {
    if (!product || !product.in_stock) return;
    setAddingId(product.id);
    const success = await addToCart(product.id, 1);
    setAddingId(null);
    if (success) {
      setAddedIds((prev) => new Set(prev).add(product.id));
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <Loader2 size={36} className="spinner-icon" />
        <p>Loading your saved wishlist items...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div style={{ maxWidth: '700px', margin: '3rem auto', textAlign: 'center' }}>
        <EmptyState
          title="Your Wishlist is Empty"
          description="You haven't saved any products to your wishlist yet. Tap the heart icon on any product to save items for later."
          actionText="Browse Trending Products"
          onAction={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="wishlist-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            <Heart size={18} fill="#ef4444" /> Saved For Later
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            My Wishlist ({wishlist.length})
          </h1>
        </div>

        <Link to="/" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>

      {/* Grid of Wishlist Items */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {wishlist.map((item) => {
          const product = item.product;
          if (!product) return null;

          const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price);
          const currentPrice = hasDiscount ? product.discount_price : product.price;
          const imageUrl = getImageUrl(product.featured_image);
          const isAdded = addedIds.has(product.id);
          const isAdding = addingId === product.id;

          return (
            <div
              key={item.id || product.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: 0,
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Image Container with Remove Button */}
              <div style={{ position: 'relative', width: '100%', height: '200px', background: 'var(--bg-elevated)' }}>
                <Link to={`/product/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <ImageOff size={24} style={{ opacity: 0.5 }} />
                    </div>
                  )}
                </Link>

                {/* Remove from Wishlist Button */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  title="Remove from wishlist"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {product.category && (
                  <span className="product-category-name" style={{ fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    {product.category.name}
                  </span>
                )}

                <Link to={`/product/${product.slug}`}>
                  <h3
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '0.5rem',
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                    title={product.title}
                  >
                    {product.title}
                  </h3>
                </Link>

                <div style={{ marginBottom: '0.75rem' }}>
                  <RatingStars rating={product.average_rating} reviewCount={product.review_count} size={13} />
                </div>

                {/* Price */}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                    ${Number(currentPrice).toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ${Number(product.price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.in_stock || isAdding}
                  className={`btn btn-sm ${isAdded ? 'btn-success' : 'btn-primary'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} /> Added to Cart
                    </>
                  ) : isAdding ? (
                    <>
                      <Loader2 size={16} className="spinner-icon" /> Adding...
                    </>
                  ) : product.in_stock ? (
                    <>
                      <ShoppingCart size={16} /> Add to Cart
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
