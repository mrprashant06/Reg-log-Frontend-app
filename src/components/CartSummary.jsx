import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';

export default function CartSummary({ cart, onCheckout, showCheckoutButton = true }) {
  const navigate = useNavigate();

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleProceed = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div
      className="cart-summary-box"
      style={{
        padding: '1.75rem',
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.35)',
      }}
    >
      <h3
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#ffffff',
          margin: '0 0 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '0.85rem',
        }}
      >
        Order Summary
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {/* Items Subtotal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.9rem' }}>
          <span>Subtotal ({cart?.totalItems || 0} items)</span>
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{formatPrice(cart?.subtotal)}</span>
        </div>

        {/* Product Discount */}
        {cart?.discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', fontSize: '0.9rem' }}>
            <span>Discounts Applied</span>
            <span style={{ fontWeight: 600 }}>- {formatPrice(cart?.discountAmount)}</span>
          </div>
        )}

        {/* Delivery Charges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.9rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Truck size={15} style={{ color: '#06b6d4' }} />
            <span>Delivery Fee</span>
          </span>
          <span>
            {cart?.freeDeliveryEligible ? (
              <span style={{ color: '#34d399', fontWeight: 700 }}>FREE</span>
            ) : (
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>{formatPrice(cart?.deliveryCharge)}</span>
            )}
          </span>
        </div>

        {/* Free Delivery Goal Banner */}
        {!cart?.freeDeliveryEligible && cart?.subtotal < 999 && (
          <div
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              fontSize: '0.75rem',
              color: '#22d3ee',
            }}
          >
            Add {formatPrice(999 - (cart?.subtotal || 0))} more to qualify for <strong>FREE Delivery</strong>!
          </div>
        )}

        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '0.5rem 0' }} />

        {/* Final Payable Amount */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>Final Payable Amount</span>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#22d3ee',
            }}
          >
            {formatPrice(cart?.finalPayableAmount)}
          </span>
        </div>
      </div>

      {showCheckoutButton && (
        <button
          type="button"
          onClick={handleProceed}
          disabled={!cart?.items || cart.items.length === 0}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: !cart?.items || cart.items.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)',
            transition: 'all 0.2s ease',
          }}
        >
          <span>Proceed to Checkout</span>
          <ArrowRight size={18} />
        </button>
      )}

      {/* Security note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
          marginTop: '1.25rem',
          fontSize: '0.775rem',
          color: '#94a3b8',
        }}
      >
        <ShieldCheck size={15} style={{ color: '#06b6d4' }} />
        <span>Razorpay 256-Bit SSL Encrypted Payment</span>
      </div>
    </div>
  );
}
