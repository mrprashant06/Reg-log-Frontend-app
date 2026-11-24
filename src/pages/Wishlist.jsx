import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Heart, Trash2, ShoppingBag, ArrowRight, Check } from 'lucide-react';

export default function Wishlist() {
  const { wishlist, wishlistCount, isLoading, removeItem, moveToBag } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [movingId, setMovingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleMoveToBag = async (productId, defaultSize = 'M') => {
    try {
      setMovingId(productId);
      await moveToBag(productId, defaultSize, 'Standard');
      setSuccessMsg('ITEM MOVED TO YOUR SHOPPING BAG');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to move to bag:', err);
    } finally {
      setMovingId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const items = wishlist?.items || [];

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
      <CustomerHeader />

      <main style={{ maxWidth: '1600px', margin: '3rem auto 6rem auto', padding: '0 2rem' }}>
        {/* Wishlist Header */}
        <div style={{ borderBottom: '1px solid #E5E5E5', paddingBottom: '1.5rem', marginBottom: '3rem' }}>
          <span className="aura-title-sub">PERSONAL SELECTION</span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <h1 className="aura-title-section" style={{ margin: 0 }}>
              WISHLIST ({wishlistCount})
            </h1>
            <Link to="/products" className="aura-link-editorial">
              CONTINUE SHOPPING &rarr;
            </Link>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: '#F7F7F7',
              borderLeft: '3px solid #287D46',
              color: '#287D46',
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Check size={16} /> {successMsg}
          </div>
        )}

        {/* Not Logged In State */}
        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <Heart size={48} strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
              PLEASE SIGN IN TO VIEW YOUR SAVED ITEMS
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#707070', maxWidth: '420px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              Your wishlist is securely synced across your devices when you are logged in to your AURA account.
            </p>
            <Link to="/login" className="aura-btn aura-btn-primary" style={{ padding: '0.85rem 2.5rem' }}>
              SIGN IN
            </Link>
          </div>
        ) : items.length === 0 ? (
          /* Empty Wishlist State */
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <Heart size={48} strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
              YOUR WISHLIST IS CURRENTLY EMPTY
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#707070', maxWidth: '450px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              Explore our new seasonal arrivals and save pieces you adore by clicking the heart icon on any garment.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/products?gender=WOMEN" className="aura-btn aura-btn-primary">
                SHOP WOMAN
              </Link>
              <Link to="/products?gender=MEN" className="aura-btn aura-btn-secondary">
                SHOP MAN
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '2.5rem 1.5rem',
            }}
          >
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Image with Direct Link to Details */}
                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '2 / 3',
                      backgroundColor: '#F7F7F7',
                      overflow: 'hidden',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                        }}
                      />
                    </Link>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(product.id)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#111111',
                        transition: 'opacity 0.2s ease',
                      }}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>

                    {product.discountPercentage > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '12px',
                          backgroundColor: '#FFFFFF',
                          color: '#C62828',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '4px 8px',
                          letterSpacing: '0.08em',
                        }}
                      >
                        -{product.discountPercentage}%
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <span className="aura-product-brand">{product.brand || 'AURA'}</span>
                  <Link
                    to={`/products/${product.id}`}
                    style={{
                      fontSize: '0.85rem',
                      color: '#111111',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      margin: '2px 0 6px 0',
                    }}
                  >
                    {product.name}
                  </Link>

                  <div className="aura-product-prices" style={{ marginBottom: '1rem' }}>
                    <span className="aura-product-price-current">
                      {formatPrice(product.sellingPrice)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.sellingPrice && (
                      <span className="aura-product-price-original">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Move to Bag Button */}
                  <button
                    onClick={() => handleMoveToBag(product.id)}
                    disabled={movingId === product.id}
                    className="aura-btn aura-btn-primary aura-btn-full"
                    style={{ padding: '0.75rem 1rem', fontSize: '0.72rem' }}
                  >
                    <ShoppingBag size={14} />
                    {movingId === product.id ? 'MOVING...' : 'MOVE TO BAG'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
