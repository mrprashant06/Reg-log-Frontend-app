import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getCartRecommendations } from '../services/api';
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Sparkles,
  ShieldCheck,
  PackageOpen,
} from 'lucide-react';

export default function Cart() {
  const { cart, isCartLoading, clearCart, refreshCart } = useCart();
  const { isAuthenticated, authToken } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
      getCartRecommendations(4, authToken)
        .then(setRecommendations)
        .catch(() => {});
    }
  }, [isAuthenticated, authToken, refreshCart]);

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '5rem auto', textAlign: 'center', padding: '2rem' }}>
          <ShoppingBag size={56} style={{ color: '#06b6d4', margin: '0 auto 1.5rem', opacity: 0.8 }} />
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800 }}>
            Your Cart is Waiting
          </h2>
          <p style={{ color: '#94a3b8', margin: '0.75rem 0 2rem' }}>
            Please log in or sign up to view and synchronize your persistent shopping cart.
          </p>
          <Link
            to="/login"
            state={{ from: '/cart' }}
            style={{
              display: 'inline-flex',
              padding: '0.85rem 2rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
        {/* Title & Clear Cart Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>
              Shopping Cart
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
              {cart?.totalItems || 0} {cart?.totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              disabled={isCartLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={14} />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 && !isCartLoading && (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '24px',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              marginBottom: '4rem',
            }}
          >
            <PackageOpen size={56} style={{ color: '#06b6d4', margin: '0 auto 1.25rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Your Cart is Empty</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 2rem' }}>
              Looks like you haven't added anything to your cart yet. Explore our luxury collections today!
            </p>
            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              <span>Explore Products</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Items List & Summary Grid */}
        {items.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            {/* Left Items Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Right Summary Column */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <CartSummary cart={cart} />
            </div>
          </div>
        )}

        {/* Complementary Recommendations Below Cart */}
        {recommendations.length > 0 && (
          <section style={{ marginTop: '5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '3rem' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Recommended Additions
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>
              Complementary luxury products frequently bundled by customers
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {recommendations.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
