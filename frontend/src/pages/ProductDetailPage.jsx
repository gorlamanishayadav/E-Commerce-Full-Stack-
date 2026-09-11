import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import RatingStars from '../components/RatingStars';
import { getImageUrl } from '../utils/imageUtils';
import { 
  ShoppingCart, 
  Check, 
  Store, 
  Star, 
  Loader2, 
  ArrowLeft,
  ImageOff,
  Heart
} from 'lucide-react';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/api/products/items/${slug}/`);
      setProduct(res.data);
      if (res.data.images && res.data.images.length > 0) {
        setSelectedImage(res.data.images[0].image);
      }
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!product.in_stock) return;
    setAddingToCart(true);
    const success = await addToCart(product.id, quantity);
    setAddingToCart(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to submit a review.', 'info');
      return;
    }
    if (!comment.trim()) {
      showToast('Please write a brief comment.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await axiosClient.post('/api/products/reviews/', {
        product: product.id,
        rating,
        comment,
      });
      showToast('Thank you! Your review has been recorded.', 'success');
      setComment('');
      fetchProduct(); // Reload reviews and average rating
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.comment?.[0] || 'Failed to submit review.';
      showToast(msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <Loader2 size={36} className="spinner-icon" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>The requested product does not exist or has been removed.</p>
        <Link to="/" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price);
  const currentPrice = hasDiscount ? product.discount_price : product.price;

  return (
    <div className="product-detail-page">
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '3.5rem' }}>
        {/* Images Gallery */}
        <div>
          <div style={{
            width: '100%',
            aspectRatio: '1/1',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            {getImageUrl(selectedImage) ? (
              <img
                src={getImageUrl(selectedImage)}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <ImageOff size={32} style={{ opacity: 0.5 }} />
                <span>No Image Provided</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
              {product.images.map((img) => {
                const thumbUrl = getImageUrl(img.image);
                return (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.image)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedImage === img.image ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      overflow: 'hidden',
                      background: 'var(--bg-elevated)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <img src={thumbUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {product.category && (
            <div className="product-category-name" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {product.category.name}
            </div>
          )}

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.8rem', lineHeight: 1.25 }}>
            {product.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <RatingStars rating={product.average_rating} reviewCount={product.review_count} size={18} />
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <span style={{ fontSize: '0.88rem', color: product.in_stock ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
              {product.in_stock ? `In Stock (${product.stock} units available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Pricing Box */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'baseline',
            gap: '1rem',
          }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
              ${Number(currentPrice).toFixed(2)}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', whiteSpace: 'pre-line' }}>
            {product.description}
          </p>

          {/* Seller Profile Card */}
          {product.seller && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--secondary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Store size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                    {product.seller.first_name ? `${product.seller.first_name} ${product.seller.last_name || ''}` : product.seller.username}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified Marketplace Merchant</div>
                </div>
              </div>
              <span className="badge badge-seller">Seller</span>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                -
              </button>
              <span style={{ padding: '0 0.5rem', fontWeight: 700, minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock || addingToCart}
              className={`btn btn-lg ${added ? 'btn-success' : 'btn-primary'}`}
              style={{ flex: 1 }}
            >
              {added ? (
                <>
                  <Check size={20} /> Added to Shopping Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={20} /> Add to Cart
                </>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className="btn btn-lg btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: isInWishlist(product.id) ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                background: isInWishlist(product.id) ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-surface)',
                color: isInWishlist(product.id) ? '#ef4444' : 'var(--text-primary)',
              }}
              title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart
                size={20}
                fill={isInWishlist(product.id) ? '#ef4444' : 'none'}
                color={isInWishlist(product.id) ? '#ef4444' : 'currentColor'}
              />
              <span>{isInWishlist(product.id) ? 'Saved' : 'Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>
          Customer Reviews ({product.review_count || 0})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Write Review Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              Write a Product Review
            </h3>

            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label className="input-label">Select Your Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer', margin: '0.5rem 0' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        <Star
                          size={24}
                          fill={star <= rating ? '#f59e0b' : 'transparent'}
                          color={star <= rating ? '#f59e0b' : 'var(--text-muted)'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Your Review & Feedback</label>
                  <textarea
                    className="form-control"
                    placeholder="Share your thoughts about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.92rem' }}>
                  Please sign in to your customer account to leave a verified rating.
                </p>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Log In to Review
                </Link>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div>
            {product.reviews && product.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                        {rev.user_username}
                      </span>
                      <RatingStars rating={rev.rating} showCount={false} size={14} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                      "{rev.comment}"
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No reviews yet. Be the first to review this product!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
