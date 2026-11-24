import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { getProductById, getProductRecommendations } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Minus,
  Plus,
  ArrowLeft,
  AlertCircle,
  Share2,
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isCartLoading } = useCart();
  const { isAuthenticated, authToken } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');
        const data = await getProductById(id, authToken);
        setProduct(data);

        // Pre-select primary image
        if (data.imageUrls && data.imageUrls.length > 0) {
          setSelectedImage(data.imageUrls[0]);
        }

        // Pre-select first size and color
        if (data.availableSizes && data.availableSizes.length > 0) {
          setSelectedSize(data.availableSizes[0]);
        }
        if (data.availableColors && data.availableColors.length > 0) {
          setSelectedColor(data.availableColors[0]);
        }

        // Related products
        if (data.relatedProducts && data.relatedProducts.length > 0) {
          setRelatedProducts(data.relatedProducts);
        } else {
          const recs = await getProductRecommendations(id, 4, authToken);
          setRelatedProducts(recs);
        }
      } catch (err) {
        setError(err.message || 'Product details not found');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, authToken]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    try {
      setActionError('');
      // Match variant if applicable
      let variantId = null;
      if (product.variants && product.variants.length > 0) {
        const match = product.variants.find(
          (v) =>
            (!selectedSize || v.size === selectedSize) &&
            (!selectedColor || v.color === selectedColor)
        );
        if (match) variantId = match.id;
      }

      await addToCart({
        productId: product.id,
        variantId,
        selectedSize: selectedSize || null,
        selectedColor: selectedColor || null,
        quantity,
      });

      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err) {
      setActionError(err.message || 'Failed to add item to cart');
    }
  };

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
        <Navbar />
        <div style={{ maxWidth: '1280px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
          <div className="spinner-glow" style={{ margin: '0 auto 1.5rem', width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(6, 182, 212, 0.2)', borderTopColor: '#06b6d4', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#94a3b8' }}>Loading product details from MySQL...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2>Product Not Found</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{error || 'This product does not exist or has been removed.'}</p>
          <Link to="/products" style={{ display: 'inline-flex', padding: '0.65rem 1.5rem', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #2563eb)', color: '#ffffff', textDecoration: 'none', fontWeight: 600 }}>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.25rem 5rem' }}>
        {/* Breadcrumb Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" style={{ color: '#94a3b8', textDecoration: 'none' }}>Products</Link>
          <ChevronRight size={14} />
          {product.categoryName && (
            <>
              <Link to={`/products?categorySlug=${product.categorySlug}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                {product.categoryName}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>{product.name}</span>
        </nav>

        {/* 2-Column Product Detail Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
          {/* Left Column: Image Gallery */}
          <div>
            {/* Primary Main Image */}
            <div
              style={{
                width: '100%',
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                paddingTop: '100%',
              }}
            >
              <img
                src={selectedImage || product.imageUrls?.[0]}
                alt={product.name}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease',
                }}
              />
            </div>

            {/* Thumbnail Strip */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.imageUrls.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      padding: 0,
                      background: 'none',
                      border: selectedImage === img ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.15)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information, Pricing & Action Selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Brand & Badge Header */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    color: '#06b6d4',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                  }}
                >
                  {product.brand}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    background: product.availableStock > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: product.availableStock > 0 ? '#34d399' : '#f87171',
                    fontWeight: 700,
                    border: product.availableStock > 0 ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(248, 113, 113, 0.3)',
                  }}
                >
                  {product.availableStock > 0 ? `In Stock (${product.availableStock} available)` : 'Out of Stock'}
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  margin: '0.5rem 0 0.75rem',
                  lineHeight: 1.2,
                }}
              >
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#eab308' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(product.rating || 5) ? '#eab308' : 'none'}
                      color="#eab308"
                    />
                  ))}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{product.rating?.toFixed(1) || '4.8'}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>({product.reviewsCount || 120} verified customer ratings)</span>
              </div>
            </div>

            {/* Price Box */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'baseline',
                gap: '1rem',
              }}
            >
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                {formatPrice(product.sellingPrice)}
              </span>
              {product.originalPrice && product.originalPrice > product.sellingPrice && (
                <>
                  <span style={{ fontSize: '1.15rem', color: '#64748b', textDecoration: 'line-through' }}>
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    Save {product.discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Product Description */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                Description
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: 1.6, margin: 0 }}>
                {product.description}
              </p>
            </div>

            {/* Size Selector */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>Select Size:</label>
                  <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 600 }}>{selectedSize}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {product.availableSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        style={{
                          minWidth: '44px',
                          height: '42px',
                          padding: '0 0.85rem',
                          borderRadius: '10px',
                          background: isSelected ? 'linear-gradient(135deg, #06b6d4, #2563eb)' : 'rgba(255, 255, 255, 0.06)',
                          border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colour Selector */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>Select Colour:</label>
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>{selectedColor}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {product.availableColors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        style={{
                          padding: '0.45rem 1rem',
                          borderRadius: '9999px',
                          background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                          border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: isSelected ? '#38bdf8' : '#cbd5e1',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '0.2rem',
                }}
              >
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.availableStock}
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: quantity >= product.availableStock ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.availableStock <= 0 || isCartLoading}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  height: '50px',
                  borderRadius: '12px',
                  background: addedSuccess
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #06b6d4, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  cursor: product.availableStock <= 0 ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                {addedSuccess ? (
                  <>
                    <Check size={20} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={19} />
                    <span>Add to Cart ({formatPrice(product.sellingPrice * quantity)})</span>
                  </>
                )}
              </button>
            </div>

            {actionError && (
              <div style={{ color: '#f87171', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.6rem 1rem', borderRadius: '8px' }}>
                {actionError}
              </div>
            )}

            {/* Trust Assurance Bullets */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                <Truck size={16} style={{ color: '#06b6d4' }} />
                <span>Express 3-5 day delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                <RotateCcw size={16} style={{ color: '#10b981' }} />
                <span>7-Day Return Policy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                <ShieldCheck size={16} style={{ color: '#3b82f6' }} />
                <span>100% Brand Authenticity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                <Sparkles size={16} style={{ color: '#a855f7' }} />
                <span>Razorpay Secured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2 & 4: Related & Recommended Products */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '3rem' }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Similar Products You Might Like
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>
              Handpicked matching items from {product.brand} and {product.categoryName || 'the same department'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
