import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, Eye, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, isCartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleQuickAdd = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      setAdding(true);
      setAddError('');
      // If product has size or color variants, select the first available
      const defaultSize = product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes[0] : null;
      const defaultColor = product.availableColors && product.availableColors.length > 0 ? product.availableColors[0] : null;

      await addToCart({
        productId: product.id,
        selectedSize: defaultSize,
        selectedColor: defaultColor,
        quantity: 1,
      });

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setAddError(err.message || 'Failed to add');
      setTimeout(() => setAddError(''), 2500);
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div
      onClick={handleCardClick}
      className="product-card"
      style={{
        position: 'relative',
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top Image Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '105%', // 1:1.05 aspect ratio
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.5)',
        }}
      >
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'}
          alt={product.name}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '0.25rem 0.55rem',
              borderRadius: '9999px',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            }}
          >
            {product.discountPercentage}% OFF
          </div>
        )}

        {/* Rating Star Badge */}
        {product.rating && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '0.725rem',
              fontWeight: 700,
              padding: '0.25rem 0.55rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Star size={12} fill="#eab308" color="#eab308" />
            <span>{product.rating.toFixed(1)}</span>
            {product.reviewsCount > 0 && (
              <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>({product.reviewsCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Product Information Body */}
      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Brand */}
          <div
            style={{
              fontSize: '0.725rem',
              textTransform: 'uppercase',
              color: '#06b6d4',
              fontWeight: 700,
              letterSpacing: '1px',
              marginBottom: '0.25rem',
            }}
          >
            {product.brand}
          </div>

          {/* Title */}
          <h4
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#f8fafc',
              margin: '0 0 0.6rem',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            title={product.name}
          >
            {product.name}
          </h4>
        </div>

        <div>
          {/* Price Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#ffffff',
              }}
            >
              {formatPrice(product.sellingPrice)}
            </span>
            {product.originalPrice && product.originalPrice > product.sellingPrice && (
              <span
                style={{
                  fontSize: '0.85rem',
                  color: '#64748b',
                  textDecoration: 'line-through',
                }}
              >
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Action Buttons: Add to Cart & View Details */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={adding || isCartLoading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                height: '40px',
                borderRadius: '10px',
                background: added
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #06b6d4, #2563eb)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: added
                  ? '0 4px 14px rgba(16, 185, 129, 0.4)'
                  : '0 4px 14px rgba(6, 182, 212, 0.35)',
              }}
            >
              {added ? (
                <>
                  <Check size={16} />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={15} />
                  <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="View Product Details"
            >
              <Eye size={17} />
            </button>
          </div>

          {addError && (
            <div style={{ color: '#f87171', fontSize: '0.725rem', marginTop: '0.35rem', textAlign: 'center' }}>
              {addError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
