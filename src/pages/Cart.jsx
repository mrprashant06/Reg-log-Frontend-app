import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingBag, Trash2, Heart, Plus, Minus, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export default function Cart() {
  const { cart, isCartLoading, updateQuantity, removeItem, clearCart, refreshCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    }
  }, [isAuthenticated, refreshCart]);

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSaveToWishlist = async (productId) => {
    try {
      await toggleWishlist(productId);
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'AURA10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('INVALID PROMO CODE. TRY "AURA10" FOR 10% OFF');
    }
  };

  const subtotal = cart?.subtotal || 0;
  const deliveryCharge = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const promoDiscount = promoApplied ? subtotal * 0.1 : 0;
  const finalTotal = Math.max(0, subtotal - promoDiscount + deliveryCharge);
  const freeShippingThreshold = 999;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
        <CustomerHeader />
        <div style={{ maxWidth: '550px', margin: '6rem auto', textAlign: 'center', padding: '2rem' }}>
          <ShoppingBag size={48} strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
            YOUR SHOPPING BAG IS WAITING
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#707070', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Sign in to access your saved garments, sync across devices, and complete your purchase.
          </p>
          <Link to="/login" state={{ from: '/cart' }} className="aura-btn aura-btn-primary" style={{ padding: '0.85rem 3rem' }}>
            SIGN IN
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
      <CustomerHeader />

      <main style={{ maxWidth: '1400px', margin: '3rem auto 6rem auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid #E5E5E5', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
          <span className="aura-title-sub">SHOPPING BAG</span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <h1 className="aura-title-section" style={{ margin: 0 }}>
              YOUR BAG ({cart?.totalItems || 0})
            </h1>
            <Link to="/products" className="aura-link-editorial">
              CONTINUE SHOPPING &rarr;
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty Bag State */
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <ShoppingBag size={48} strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
              YOUR SHOPPING BAG IS EMPTY
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#707070', maxWidth: '400px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
              Browse our new seasonal editorial collection and select items to add to your bag.
            </p>
            <Link to="/products" className="aura-btn aura-btn-primary" style={{ padding: '0.85rem 2.5rem' }}>
              EXPLORE COLLECTION
            </Link>
          </div>
        ) : (
          /* Bag Layout: 2 Columns (Items List + Order Summary) */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 0.9fr',
              gap: '4rem',
              alignItems: 'start',
            }}
          >
            {/* Left: Bag Items List */}
            <div>
              {/* Free Delivery Threshold Bar */}
              <div
                style={{
                  backgroundColor: '#F7F7F7',
                  padding: '1.25rem',
                  marginBottom: '2rem',
                  border: '1px solid #E5E5E5',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  <span>
                    {amountToFreeShipping === 0
                      ? 'CONGRATULATIONS! YOU HAVE UNLOCKED FREE STANDARD SHIPPING'
                      : `ADD ${formatPrice(amountToFreeShipping)} MORE FOR FREE SHIPPING`}
                  </span>
                  <span>{progressPercent.toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#E5E5E5' }}>
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      backgroundColor: '#111111',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr auto',
                      gap: '1.5rem',
                      padding: '1.5rem 0',
                      borderBottom: '1px solid #E5E5E5',
                    }}
                  >
                    {/* Item Image */}
                    <div style={{ aspectRatio: '2 / 3', backgroundColor: '#F7F7F7', overflow: 'hidden' }}>
                      <Link to={`/products/${item.productId}`}>
                        <img
                          src={item.productImageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'}
                          alt={item.productName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Link>
                    </div>

                    {/* Item Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span className="aura-product-brand">{item.productBrand || 'AURA'}</span>
                        <Link
                          to={`/products/${item.productId}`}
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: '#111111',
                            textDecoration: 'none',
                            display: 'block',
                            margin: '2px 0 6px 0',
                          }}
                        >
                          {item.productName}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: '#707070', display: 'flex', gap: '1rem' }}>
                          <span>SIZE: {item.selectedSize || 'M'}</span>
                          <span>COLOUR: {item.selectedColor || 'Standard'}</span>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                        {/* Quantity Stepper */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #E5E5E5' }}>
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            style={{ background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer' }}
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ fontSize: '0.8rem', padding: '0 8px', minWidth: '24px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{ background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer' }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Save to Wishlist */}
                        <button
                          onClick={() => handleSaveToWishlist(item.productId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '0.72rem',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: '#707070',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                          }}
                        >
                          SAVE FOR LATER
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#707070',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Item Total Price */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div
              style={{
                backgroundColor: '#F7F7F7',
                border: '1px solid #E5E5E5',
                padding: '2rem',
                position: 'sticky',
                top: '100px',
              }}
            >
              <h3 style={{ fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 1.5rem 0' }}>
                ORDER SUMMARY
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem', borderBottom: '1px solid #E5E5E5', paddingBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#707070' }}>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#707070' }}>Estimated Delivery</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span>
                </div>

                {promoApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#287D46' }}>
                    <span>Promo Discount (10%)</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} style={{ margin: '1.25rem 0' }}>
                <div style={{ display: 'flex' }}>
                  <input
                    type="text"
                    placeholder="PROMO CODE (e.g. AURA10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.72rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      border: '1px solid #E5E5E5',
                      borderRight: 'none',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  <button
                    type="submit"
                    className="aura-btn aura-btn-secondary"
                    style={{ padding: '0.65rem 1rem', fontSize: '0.72rem' }}
                  >
                    APPLY
                  </button>
                </div>
                {promoError && (
                  <p style={{ fontSize: '0.7rem', color: '#C62828', margin: '6px 0 0 0' }}>
                    {promoError}
                  </p>
                )}
                {promoApplied && (
                  <p style={{ fontSize: '0.7rem', color: '#287D46', margin: '6px 0 0 0' }}>
                    PROMO APPLIED SUCCESSFULLY (-10%)
                  </p>
                )}
              </form>

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #E5E5E5', paddingTop: '1.25rem', marginBottom: '1.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  TOTAL
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 600 }}>
                  {formatPrice(finalTotal)}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="aura-btn aura-btn-primary aura-btn-full"
                style={{ padding: '1rem', fontSize: '0.8rem' }}
              >
                CONTINUE TO CHECKOUT
              </button>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.72rem', color: '#707070' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} /> Encrypted 256-bit secure checkout
                </span>
                <span>Complimentary 30-day returns on all garments</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
