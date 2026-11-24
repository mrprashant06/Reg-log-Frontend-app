import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, ShoppingBag, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSuccessModal({ order, onClose }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b', '#ffffff'],
      });
    } catch {
      // Confetti fallback
    }

    // 5-second countdown timer for auto-redirect
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
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(7, 11, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      <div
        className="order-success-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          borderRadius: '24px',
          padding: '2.25rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(6, 182, 212, 0.25)',
          textAlign: 'center',
          animation: 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Animated Success Badge */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.3))',
            border: '2px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)',
          }}
        >
          <CheckCircle2 size={44} style={{ color: '#34d399' }} />
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#ffffff',
            margin: '0 0 0.5rem',
          }}
        >
          Congratulations!
        </h2>
        <p style={{ color: '#22d3ee', fontWeight: 600, fontSize: '1rem', margin: '0 0 1.5rem' }}>
          Your Order Has Been Placed Successfully!
        </p>

        {/* Order Details Receipt Box */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: '#94a3b8' }}>Order ID:</span>
            <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>
              #{order?.orderNumber || order?.id}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: '#94a3b8' }}>Total Amount:</span>
            <strong style={{ color: '#22d3ee', fontSize: '1.05rem' }}>
              {formatPrice(order?.totalAmount)}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: '#94a3b8' }}>Payment Method:</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>
              {order?.paymentMethod || 'Razorpay Online'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: '#94a3b8' }}>Order Date:</span>
            <span style={{ color: '#cbd5e1' }}>{formattedDate}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: '#94a3b8' }}>Estimated Delivery:</span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>
              {order?.estimatedDeliveryInfo || '3-5 Business Days'}
            </span>
          </div>
        </div>

        {/* Countdown redirect indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            color: '#94a3b8',
            fontSize: '0.825rem',
            marginBottom: '1.5rem',
          }}
        >
          <Clock size={15} style={{ color: '#06b6d4' }} />
          <span>
            Redirecting to <strong>My Orders</strong> in <strong style={{ color: '#22d3ee' }}>{countdown}s</strong>...
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Package size={17} />
            <span>View My Orders</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              navigate('/dashboard');
            }}
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <ShoppingBag size={17} />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
}
