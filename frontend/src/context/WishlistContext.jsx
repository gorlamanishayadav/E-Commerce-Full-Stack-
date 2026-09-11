import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosClient.get('/api/products/wishlist/');
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setWishlist(data);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      const numId = Number(productId);
      return wishlist.some((item) => Number(item.product?.id || item.product) === numId);
    },
    [wishlist]
  );

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      showToast('Please log in to add items to your wishlist.', 'info');
      return false;
    }

    const productId = Number(product?.id || product);
    const currentlyWishlisted = isInWishlist(productId);

    // Optimistic state update
    if (currentlyWishlisted) {
      setWishlist((prev) => prev.filter((item) => Number(item.product?.id || item.product) !== productId));
    } else {
      // Temporary optimistic item
      const optimisticItem = {
        id: `temp-${Date.now()}`,
        product: typeof product === 'object' ? product : { id: productId },
        created_at: new Date().toISOString(),
      };
      setWishlist((prev) => [optimisticItem, ...prev]);
    }

    try {
      const res = await axiosClient.post('/api/products/wishlist/toggle/', { product_id: productId });
      if (res.data.is_wishlisted) {
        showToast(res.data.message || 'Added to your wishlist!', 'success');
      } else {
        showToast(res.data.message || 'Removed from your wishlist.', 'info');
      }
      // Re-sync with backend to obtain official IDs
      fetchWishlist();
      return res.data.is_wishlisted;
    } catch (err) {
      // Revert on error
      fetchWishlist();
      const msg = err.response?.data?.error || 'Failed to update wishlist.';
      showToast(msg, 'error');
      return currentlyWishlisted;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;
    const numId = Number(productId);
    setWishlist((prev) => prev.filter((item) => Number(item.product?.id || item.product) !== numId));
    try {
      await axiosClient.post('/api/products/wishlist/toggle/', { product_id: numId });
      showToast('Removed from wishlist.', 'info');
      fetchWishlist();
    } catch (err) {
      fetchWishlist();
      showToast('Failed to remove item from wishlist.', 'error');
    }
  };

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    loading,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
