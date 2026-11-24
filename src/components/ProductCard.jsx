import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [isHovered, setIsHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isWishlisted = isInWishlist(product?.id);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    try {
      await toggleWishlist(product.id);
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleQuickAddSize = async (e, size) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      setAdding(true);
      const defaultColor = product.availableColors && product.availableColors.length > 0 ? product.availableColors[0] : 'Standard';
      await addToCart({
        productId: product.id,
        selectedSize: size,
        selectedColor: defaultColor,
        quantity: 1,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add to bag:', err);
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const primaryImage = product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop';
  const secondaryImage = product.secondaryImageUrl || primaryImage;

  return (
    <div
      className="aura-product-card"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Editorial Image Container with Dual Image Hover */}
      <div className="aura-product-image-wrap">
        <img
          src={primaryImage}
          alt={product.name}
          className="aura-product-img-primary"
          loading="lazy"
        />
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="aura-product-img-secondary"
            loading="lazy"
          />
        )}

        {/* Wishlist Button */}
        <button
          className={`aura-product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={isWishlisted ? '#C62828' : 'none'}
            color={isWishlisted ? '#C62828' : '#111111'}
          />
        </button>

        {/* Badges */}
        <div className="aura-product-badges">
          {product.discountPercentage > 0 && (
            <span className="aura-product-badge sale">
              -{product.discountPercentage}%
            </span>
          )}
          {product.isFeatured && (
            <span className="aura-product-badge">
              NEW
            </span>
          )}
        </div>

        {/* Quick Add Size Drawer on Card Hover */}
        <div className="aura-quick-add-drawer">
          {added ? (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#287D46', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} /> ADDED TO BAG
            </span>
          ) : product.availableSizes && product.availableSizes.length > 0 ? (
            <>
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#707070' }}>
                ADD:
              </span>
              {product.availableSizes.slice(0, 4).map((size) => (
                <button
                  key={size}
                  className="aura-quick-size-btn"
                  onClick={(e) => handleQuickAddSize(e, size)}
                  disabled={adding}
                >
                  {size}
                </button>
              ))}
            </>
          ) : (
            <button
              className="aura-btn aura-btn-primary aura-btn-full"
              style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}
              onClick={(e) => handleQuickAddSize(e, 'Standard')}
              disabled={adding}
            >
              <Plus size={14} /> QUICK ADD
            </button>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="aura-product-info">
        <span className="aura-product-brand">{product.brand || 'AURA'}</span>
        <h3 className="aura-product-name" title={product.name}>
          {product.name}
        </h3>

        <div className="aura-product-prices">
          <span className="aura-product-price-current">
            {formatPrice(product.sellingPrice)}
          </span>
          {product.originalPrice && product.originalPrice > product.sellingPrice && (
            <span className="aura-product-price-original">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          {product.discountPercentage > 0 && (
            <span className="aura-product-price-discount">
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        {/* Color Indicators */}
        {product.availableColors && product.availableColors.length > 0 && (
          <div className="aura-product-colors">
            {product.availableColors.slice(0, 4).map((c, idx) => (
              <span
                key={idx}
                className="aura-color-dot"
                style={{
                  backgroundColor:
                    c.toLowerCase().includes('black') ? '#111111' :
                    c.toLowerCase().includes('white') ? '#FFFFFF' :
                    c.toLowerCase().includes('blue') ? '#1E3A8A' :
                    c.toLowerCase().includes('green') ? '#047857' :
                    c.toLowerCase().includes('red') ? '#B91C1C' :
                    c.toLowerCase().includes('beige') || c.toLowerCase().includes('cream') ? '#D7C4B7' :
                    '#9CA3AF'
                }}
                title={c}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
