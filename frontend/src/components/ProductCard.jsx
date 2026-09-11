import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, ImageOff, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import RatingStars from './RatingStars';
import { getImageUrl } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const wishlisted = isInWishlist(product.id);
  const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.discount_price)) / Number(product.price)) * 100)
    : 0;

  const currentPrice = hasDiscount ? product.discount_price : product.price;
  const imageUrl = getImageUrl(product.featured_image);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.in_stock) return;

    setAdding(true);
    const success = await addToCart(product.id, 1);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="product-card" style={{ position: 'relative' }}>
      {/* Floating Wishlist Heart */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 4,
          backdropFilter: 'blur(4px)',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Heart
          size={16}
          color={wishlisted ? '#ef4444' : '#fff'}
          fill={wishlisted ? '#ef4444' : 'none'}
        />
      </button>

      <Link to={`/product/${product.slug}`} className="product-card-image-wrap">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="product-card-image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
            }}
          >
            <ImageOff size={22} style={{ opacity: 0.6 }} />
            <span>Product Image</span>
          </div>
        )}

        {hasDiscount && <div className="product-discount-tag">-{discountPercent}%</div>}
      </Link>

      <div className="product-card-body">
        {product.category && (
          <div className="product-category-name">{product.category.name}</div>
        )}

        <Link to={`/product/${product.slug}`}>
          <h3 className="product-card-title" title={product.title}>
            {product.title}
          </h3>
        </Link>

        <div className="product-rating-row">
          <RatingStars rating={product.average_rating} reviewCount={product.review_count} />
        </div>

        <div className="product-card-footer">
          <div className="product-price-box">
            <span className="product-main-price">${Number(currentPrice).toFixed(2)}</span>
            {hasDiscount && (
              <span className="product-original-price">${Number(product.price).toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock || adding}
            className={`btn btn-sm ${added ? 'btn-success' : 'btn-primary'}`}
            title={product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          >
            {added ? (
              <>
                <Check size={14} /> Added
              </>
            ) : product.in_stock ? (
              <>
                <ShoppingCart size={14} /> Add
              </>
            ) : (
              'Sold Out'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
