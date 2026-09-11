import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState({
    items: [],
    total_price: '0.00',
    total_items_count: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total_price: '0.00', total_items_count: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/orders/cart/');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please log in to add items to your cart.', 'info');
      return false;
    }
    try {
      setLoading(true);
      const res = await axiosClient.post('/api/orders/cart/', {
        product_id: productId,
        quantity,
      });
      setCart(res.data);
      showToast('Added to shopping cart!', 'success');
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add product to cart.';
      showToast(msg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await axiosClient.patch(`/api/orders/cart/items/${itemId}/`, {
        quantity,
      });
      setCart(res.data);
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update quantity.';
      showToast(msg, 'error');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await axiosClient.delete(`/api/orders/cart/items/${itemId}/`);
      setCart(res.data);
      showToast('Item removed from cart.', 'info');
      return true;
    } catch (err) {
      showToast('Failed to remove item.', 'error');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await axiosClient.delete('/api/orders/cart/');
      setCart({ items: [], total_price: '0.00', total_items_count: 0 });
      showToast('Cart cleared.', 'info');
      return true;
    } catch (err) {
      showToast('Failed to clear cart.', 'error');
      return false;
    }
  };

  const value = {
    cart,
    loading,
    cartCount: cart.total_items_count || 0,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
