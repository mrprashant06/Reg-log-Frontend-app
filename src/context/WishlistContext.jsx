import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import * as api from '../services/api';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { authToken, isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const [wishlist, setWishlist] = useState(null);
  const [wishlistProductIds, setWishlistProductIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated || !authToken) {
      setWishlist(null);
      setWishlistProductIds(new Set());
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const data = await api.getWishlist(authToken);
      setWishlist(data);
      if (data && data.items) {
        const idSet = new Set(data.items.map(item => item.product?.id).filter(Boolean));
        setWishlistProductIds(idSet);
      } else {
        setWishlistProductIds(new Set());
      }
    } catch (err) {
      setError(err.message || 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [authToken, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      refreshWishlist();
    } else {
      setWishlist(null);
      setWishlistProductIds(new Set());
    }
  }, [isAuthenticated, authToken, refreshWishlist]);

  const isInWishlist = useCallback((productId) => {
    if (!productId) return false;
    return wishlistProductIds.has(Number(productId));
  }, [wishlistProductIds]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated || !authToken) {
      throw new Error('Please log in to save items to your wishlist');
    }
    const numId = Number(productId);
    const currentlyIn = wishlistProductIds.has(numId);

    // Optimistic UI update
    setWishlistProductIds(prev => {
      const next = new Set(prev);
      if (currentlyIn) next.delete(numId);
      else next.add(numId);
      return next;
    });

    try {
      if (currentlyIn) {
        const res = await api.removeFromWishlist(numId, authToken);
        setWishlist(res);
      } else {
        const res = await api.addToWishlist(numId, authToken);
        setWishlist(res);
      }
    } catch (err) {
      // Revert on failure
      setWishlistProductIds(prev => {
        const next = new Set(prev);
        if (currentlyIn) next.add(numId);
        else next.delete(numId);
        return next;
      });
      setError(err.message || 'Could not update wishlist');
      throw err;
    }
  };

  const removeItem = async (productId) => {
    if (!authToken) return;
    const numId = Number(productId);
    try {
      const res = await api.removeFromWishlist(numId, authToken);
      setWishlist(res);
      setWishlistProductIds(prev => {
        const next = new Set(prev);
        next.delete(numId);
        return next;
      });
    } catch (err) {
      setError(err.message || 'Failed to remove item');
      throw err;
    }
  };

  const moveToBag = async (productId, size = 'M', color = 'Standard') => {
    if (!authToken) return;
    const numId = Number(productId);
    try {
      const res = await api.moveWishlistToCart(numId, size, color, authToken);
      setWishlist(res);
      setWishlistProductIds(prev => {
        const next = new Set(prev);
        next.delete(numId);
        return next;
      });
      if (refreshCart) {
        await refreshCart();
      }
    } catch (err) {
      setError(err.message || 'Failed to move item to bag');
      throw err;
    }
  };

  const wishlistCount = wishlist?.totalItems || wishlistProductIds.size || 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        isLoading,
        error,
        isInWishlist,
        toggleWishlist,
        removeItem,
        moveToBag,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
