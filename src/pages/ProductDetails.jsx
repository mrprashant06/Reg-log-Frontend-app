import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import ProductCard from '../components/ProductCard';
import { getProductById, getProductRecommendations } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart, ShoppingBag, Check, ChevronDown, ChevronUp, Ruler, X } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, authToken } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToBag, setAddingToBag] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Accordion states
  const [openAccordion, setOpenAccordion] = useState('materials');

  const isWishlisted = isInWishlist(product?.id);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');
        const data = await getProductById(id, authToken);
        setProduct(data);

        const imgs = data.images?.map(i => i.imageUrl) || data.imageUrls || [];
        if (imgs.length > 0) {
          setSelectedImage(imgs[0]);
        }

        if (data.availableSizes && data.availableSizes.length > 0) {
          setSelectedSize(data.availableSizes[0]);
        }
        if (data.availableColors && data.availableColors.length > 0) {
          setSelectedColor(data.availableColors[0]);
        }

        const related = await getProductRecommendations(id, 4);
        setRelatedProducts(related || []);
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [id, authToken]);

  const handleAddToBag = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      setAddingToBag(true);
      await addToCart({
        productId: product.id,
        selectedSize: selectedSize || 'Standard',
        selectedColor: selectedColor || 'Standard',
        quantity: quantity,
      });
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to add to bag:', err);
    } finally {
      setAddingToBag(false);
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

  if (loading) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
        <CustomerHeader />
        <div style={{ textAlign: 'center', padding: '10rem 2rem', fontSize: '0.85rem', color: '#707070' }}>
          LOADING GARMENT DETAILS...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
        <CustomerHeader />
        <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            GARMENT NOT FOUND
          </h2>
          <Link to="/products" className="aura-btn aura-btn-primary" style={{ marginTop: '2rem' }}>
            BACK TO COLLECTION
          </Link>
        </div>
      </div>
    );
  }

  const allImages = product.images?.map(i => i.imageUrl) || product.imageUrls || [product.imageUrl];

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
      <CustomerHeader />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '2rem', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#707070' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>HOME</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>COLLECTION</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#111111' }}>{product.name}</span>
        </div>

        {/* 2-Column Editorial Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '4rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Stacked Editorial Image Gallery (Zara Style) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {allImages.map((imgUrl, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  width: '100%',
                  backgroundColor: '#F7F7F7',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} angle ${idx + 1}`}
                  style={{
                    width: '100%',
                    display: 'block',
                    objectFit: 'cover',
                  }}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Product Purchase Details */}
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span className="aura-product-brand" style={{ fontSize: '0.75rem', letterSpacing: '0.15em' }}>
                {product.brand || 'AURA'}
              </span>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 400, letterSpacing: '0.04em', margin: '0.35rem 0 0.75rem 0' }}>
                {product.name}
              </h1>

              <div className="aura-product-prices" style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                  {formatPrice(product.sellingPrice)}
                </span>
                {product.originalPrice && product.originalPrice > product.sellingPrice && (
                  <span style={{ fontSize: '1rem', color: '#999999', textDecoration: 'line-through' }}>
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="aura-product-price-discount" style={{ fontSize: '0.85rem' }}>
                    -{product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.85rem', color: '#707070', lineHeight: 1.7, margin: 0 }}>
                {product.description}
              </p>
            </div>

            {/* Color Swatches */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  <span>COLOUR: {selectedColor}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {product.availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: '6px 12px',
                        border: selectedColor === color ? '1px solid #111111' : '1px solid #E5E5E5',
                        background: '#FFFFFF',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: selectedColor === color ? 600 : 400,
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector with Stock Warning */}
            <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  SELECT SIZE
                </span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#707070',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Ruler size={13} /> SIZE GUIDE
                </button>
              </div>

              <div className="aura-size-chips">
                {(product.availableSizes && product.availableSizes.length > 0
                  ? product.availableSizes
                  : ['XS', 'S', 'M', 'L', 'XL']
                ).map((size) => (
                  <button
                    key={size}
                    className={`aura-size-chip ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {product.availableStock > 0 && product.availableStock <= 5 && (
                <p style={{ fontSize: '0.72rem', color: '#B45309', margin: '0.75rem 0 0 0', letterSpacing: '0.05em' }}>
                  FEW ITEMS LEFT IN STOCK ({product.availableStock} remaining)
                </p>
              )}
            </div>

            {/* Primary Action Buttons: Add to Bag & Wishlist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleAddToBag}
                disabled={addingToBag}
                className="aura-btn aura-btn-primary aura-btn-full"
                style={{ padding: '1rem', fontSize: '0.8rem' }}
              >
                <ShoppingBag size={16} />
                {addingToBag ? 'ADDING...' : addedSuccess ? 'ADDED TO SHOPPING BAG' : 'ADD TO BAG'}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className="aura-btn aura-btn-secondary aura-btn-full"
                style={{ padding: '0.85rem', fontSize: '0.8rem' }}
              >
                <Heart
                  size={16}
                  strokeWidth={1.5}
                  fill={isWishlisted ? '#C62828' : 'none'}
                  color={isWishlisted ? '#C62828' : '#111111'}
                />
                {isWishlisted ? 'SAVED TO WISHLIST' : 'SAVE TO WISHLIST'}
              </button>
            </div>

            {/* Minimalist Accordions for Materials, Care, Shipping */}
            <div className="aura-accordion" style={{ marginTop: '1.5rem' }}>
              <div className="aura-accordion-item">
                <button
                  className="aura-accordion-trigger"
                  onClick={() => setOpenAccordion(openAccordion === 'materials' ? '' : 'materials')}
                >
                  <span>COMPOSITION & CARE</span>
                  {openAccordion === 'materials' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'materials' && (
                  <div className="aura-accordion-content">
                    Crafted from 100% natural fibers with certified traceability. To ensure garment longevity, hand wash in cold water or dry clean. Do not tumble dry. Low temperature iron on reverse.
                  </div>
                )}
              </div>

              <div className="aura-accordion-item">
                <button
                  className="aura-accordion-trigger"
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                >
                  <span>DELIVERY & FREE RETURNS</span>
                  {openAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'shipping' && (
                  <div className="aura-accordion-content">
                    Standard delivery: 2-4 business days. Free delivery on all orders above ₹999. Complimentary returns accepted within 30 days of purchase in original condition with tags intact.
                  </div>
                )}
              </div>

              <div className="aura-accordion-item">
                <button
                  className="aura-accordion-trigger"
                  onClick={() => setOpenAccordion(openAccordion === 'sustainability' ? '' : 'sustainability')}
                >
                  <span>ORIGIN & SUSTAINABILITY</span>
                  {openAccordion === 'sustainability' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'sustainability' && (
                  <div className="aura-accordion-content">
                    Produced under ethical workplace protocols with closed-loop dyeing technology to reduce water consumption by 65%. Packaging is 100% recycled biodegradable paperboard.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Complete The Look Section */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '8rem', borderTop: '1px solid #E5E5E5', paddingTop: '4rem' }}>
            <span className="aura-title-sub">YOU MAY ALSO LIKE</span>
            <h2 className="aura-title-section" style={{ margin: '0.25rem 0 2rem 0' }}>
              COMPLETE THE LOOK
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '2rem 1.5rem',
              }}
            >
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              maxWidth: '550px',
              width: '100%',
              padding: '2.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                SIZE GUIDE (CM)
              </h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #111111' }}>
                  <th style={{ padding: '8px' }}>SIZE</th>
                  <th style={{ padding: '8px' }}>CHEST / BUST</th>
                  <th style={{ padding: '8px' }}>WAIST</th>
                  <th style={{ padding: '8px' }}>HIPS</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E5E5' }}><td style={{ padding: '8px' }}>XS</td><td style={{ padding: '8px' }}>82 - 86</td><td style={{ padding: '8px' }}>62 - 66</td><td style={{ padding: '8px' }}>88 - 92</td></tr>
                <tr style={{ borderBottom: '1px solid #E5E5E5' }}><td style={{ padding: '8px' }}>S</td><td style={{ padding: '8px' }}>86 - 90</td><td style={{ padding: '8px' }}>66 - 70</td><td style={{ padding: '8px' }}>92 - 96</td></tr>
                <tr style={{ borderBottom: '1px solid #E5E5E5' }}><td style={{ padding: '8px' }}>M</td><td style={{ padding: '8px' }}>90 - 94</td><td style={{ padding: '8px' }}>70 - 74</td><td style={{ padding: '8px' }}>96 - 100</td></tr>
                <tr style={{ borderBottom: '1px solid #E5E5E5' }}><td style={{ padding: '8px' }}>L</td><td style={{ padding: '8px' }}>94 - 98</td><td style={{ padding: '8px' }}>74 - 78</td><td style={{ padding: '8px' }}>100 - 104</td></tr>
                <tr style={{ borderBottom: '1px solid #E5E5E5' }}><td style={{ padding: '8px' }}>XL</td><td style={{ padding: '8px' }}>98 - 104</td><td style={{ padding: '8px' }}>78 - 84</td><td style={{ padding: '8px' }}>104 - 110</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
