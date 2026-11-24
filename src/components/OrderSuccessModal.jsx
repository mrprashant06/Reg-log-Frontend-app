import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Package, ArrowRight, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSuccessModal({ order, onClose }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#111111', '#287D46', '#707070', '#E5E5E5'],
      });
    } catch {
      // Confetti fallback
    }

    // Exact 5-second countdown timer for auto-redirect
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #111111',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          animation: 'auraFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#111111',
            color: '#FFFFFF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <Check size={32} strokeWidth={2} />
        </div>

        {/* Heading */}
        <span className="aura-title-sub">PURCHASE CONFIRMED</span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0.35rem 0 0.75rem 0' }}>
          THANK YOU FOR YOUR ORDER
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#707070', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
          Your order has been recorded and is being prepared for dispatch. We have sent a confirmation with delivery updates to your contact details.
        </p>

        {/* Order Details Receipt Box */}
        <div
          style={{
            backgroundColor: '#F7F7F7',
            border: '1px solid #E5E5E5',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#707070' }}>ORDER REFERENCE:</span>
            <strong style={{ letterSpacing: '0.05em' }}>
              #{order?.orderNumber || order?.id || 'AURA-ORD-1001'}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#707070' }}>TOTAL AMOUNT:</span>
            <strong style={{ fontSize: '0.95rem' }}>
              {formatPrice(order?.totalAmount)}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#707070' }}>PAYMENT METHOD:</span>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {order?.paymentMethod || 'SECURE CHECKOUT'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#707070' }}>ESTIMATED DELIVERY:</span>
            <span style={{ color: '#287D46', fontWeight: 600 }}>2 - 4 BUSINESS DAYS</span>
          </div>
        </div>

        {/* 5-Second Countdown Alert */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#707070',
            marginBottom: '1.5rem',
          }}
        >
          <Clock size={14} /> REDIRECTING TO ORDER TRACKING IN {countdown}S...
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/orders')}
          className="aura-btn aura-btn-primary aura-btn-full"
          style={{ padding: '0.9rem', fontSize: '0.78rem' }}
        >
          VIEW MY ORDERS NOW &rarr;
        </button>
      </div>
    </div>
  );
}
