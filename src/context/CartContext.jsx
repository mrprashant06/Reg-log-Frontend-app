import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { authToken, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !authToken) {
      setCart(null);
      return;
    }
    try {
      setIsCartLoading(true);
      setCartError('');
      const data = await api.getCart(authToken);
      setCart(data);
    } catch (err) {
      setCartError(err.message || 'Failed to load cart');
    } finally {
      setIsCartLoading(false);
    }
  }, [authToken, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, authToken, refreshCart]);

  const addToCart = async ({ productId, variantId, selectedSize, selectedColor, quantity = 1 }) => {
    if (!isAuthenticated || !authToken) {
      throw new Error('Please log in to add items to your shopping cart');
    }
    try {
      setIsCartLoading(true);
      setCartError('');
      const updatedCart = await api.addToCart(
        { productId, variantId, selectedSize, selectedColor, quantity },
        authToken
      );
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setCartError(err.message || 'Could not add item to cart');
      throw err;
    } finally {
      setIsCartLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!authToken) return;
    try {
      setIsCartLoading(true);
      setCartError('');
      const updatedCart = await api.updateCartItem(itemId, quantity, authToken);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setCartError(err.message || 'Failed to update item quantity');
      throw err;
    } finally {
      setIsCartLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!authToken) return;
    try {
      setIsCartLoading(true);
      setCartError('');
      const updatedCart = await api.removeCartItem(itemId, authToken);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setCartError(err.message || 'Failed to remove item');
      throw err;
    } finally {
      setIsCartLoading(false);
    }
  };

  const clearUserCart = async () => {
    if (!authToken) return;
    try {
      setIsCartLoading(true);
      await api.clearCart(authToken);
      setCart({
        items: [],
        totalItems: 0,
        subtotal: 0,
        discountAmount: 0,
        deliveryCharge: 0,
        finalPayableAmount: 0,
        freeDeliveryEligible: false,
      });
    } catch (err) {
      setCartError(err.message || 'Failed to clear cart');
    } finally {
      setIsCartLoading(false);
    }
  };

  const value = {
    cart,
    totalItems: cart?.totalItems || 0,
    isCartLoading,
    cartError,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart: clearUserCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
