import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cancelOrder, returnOrder } from '../services/api';

export default function OrderCard({ order, authToken, onOrderUpdated }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ORDER_PLACED':
        return { label: 'Order Placed', color: '#111111', bg: '#F7F7F7', icon: Clock };
      case 'CONFIRMED':
        return { label: 'Confirmed', color: '#111111', bg: '#F0F0F0', icon: CheckCircle2 };
      case 'SHIPPED':
        return { label: 'Shipped', color: '#B45309', bg: '#FEF3C7', icon: Truck };
      case 'DELIVERED':
        return { label: 'Delivered', color: '#287D46', bg: '#DEF7EC', icon: CheckCircle2 };
      case 'CANCELLED':
        return { label: 'Cancelled', color: '#C62828', bg: '#FDE8E8', icon: XCircle };
      default:
        return { label: status, color: '#707070', bg: '#F7F7F7', icon: Clock };
    }
  };

  const statusInfo = getStatusBadge(order.status);
  const StatusIcon = statusInfo.icon;

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      await cancelOrder(order.id, reason.trim() || 'Customer requested cancellation', authToken);
      setShowCancelPrompt(false);
      setReason('');
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      setActionError(err.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      await returnOrder(order.id, reason.trim() || 'Customer return', authToken);
      setShowReturnPrompt(false);
      setReason('');
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      setActionError(err.message || 'Failed to submit return request');
    } finally {
      setActionLoading(false);
    }
  };

  const trackingSteps = [
    { label: 'Placed', active: true },
    { label: 'Confirmed', active: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
    { label: 'Shipped', active: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
    { label: 'Out for Delivery', active: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
    { label: 'Delivered', active: order.status === 'DELIVERED' },
  ];

  return (
    <div
      style={{
        border: '1px solid #E5E5E5',
        backgroundColor: '#FFFFFF',
        marginBottom: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#F7F7F7',
          borderBottom: '1px solid #E5E5E5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#707070', display: 'block' }}>
              ORDER REFERENCE
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              #{order.orderNumber || order.id}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#707070', display: 'block' }}>
              ORDER DATE
            </span>
            <span style={{ fontSize: '0.85rem' }}>{formattedDate}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#707070', display: 'block' }}>
              TOTAL
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span
            style={{
              padding: '4px 10px',
              backgroundColor: statusInfo.bg,
              color: statusInfo.color,
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {statusInfo.label}
          </span>

          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#111111',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Toggle details"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Stepper Tracking Bar */}
      {order.status !== 'CANCELLED' && (
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E5E5E5', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {trackingSteps.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: step.active ? '#111111' : '#E5E5E5',
                    border: '2px solid #FFFFFF',
                    marginBottom: '6px',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.68rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: step.active ? '#111111' : '#707070',
                    fontWeight: step.active ? 600 : 400,
                    textAlign: 'center',
                  }}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item Rows Preview */}
      <div style={{ padding: '1.5rem' }}>
        {order.items?.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'center',
              padding: '0.75rem 0',
              borderBottom: '1px solid #F7F7F7',
            }}
          >
            <img
              src={item.productImageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'}
              alt={item.productName}
              style={{ width: '60px', height: '80px', objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: '#707070', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {item.productBrand || 'AURA'}
              </span>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 500, margin: '2px 0 4px 0' }}>
                {item.productName}
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#707070' }}>
                Size: {item.selectedSize || 'M'} | Qty: {item.quantity}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              {formatPrice(item.totalPrice)}
            </span>
          </div>
        ))}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/orders/${order.id}`)}
            className="aura-btn aura-btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }}
          >
            ORDER DETAILS & INVOICE
          </button>

          {['ORDER_PLACED', 'CONFIRMED'].includes(order.status) && (
            <button
              onClick={() => setShowCancelPrompt(true)}
              className="aura-btn aura-btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.72rem', borderColor: '#C62828', color: '#C62828' }}
            >
              CANCEL ORDER
            </button>
          )}

          {order.status === 'DELIVERED' && (
            <button
              onClick={() => setShowReturnPrompt(true)}
              className="aura-btn aura-btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }}
            >
              REQUEST RETURN / EXCHANGE
            </button>
          )}
        </div>
      </div>

      {/* Cancel Prompt Modal */}
      {showCancelPrompt && (
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#FDE8E8',
            borderTop: '1px solid #C62828',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#C62828' }}>
            CONFIRM ORDER CANCELLATION
          </span>
          <input
            type="text"
            placeholder="Reason for cancellation (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '0.75rem', border: '1px solid #E5E5E5' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="aura-btn aura-btn-sale"
              style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }}
            >
              {actionLoading ? 'CANCELLING...' : 'CONFIRM CANCELLATION'}
            </button>
            <button
              onClick={() => setShowCancelPrompt(false)}
              className="aura-btn aura-btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }}
            >
              KEEP ORDER
            </button>
          </div>
        </div>
      )}

      {/* Return Prompt Modal */}
      {showReturnPrompt && (
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#F7F7F7',
            borderTop: '1px solid #111111',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            REQUEST RETURN / EXCHANGE
          </span>
          <input
            type="text"
            placeholder="Reason for return (e.g. Size does not fit)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '0.75rem', border: '1px solid #E5E5E5' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleReturn}
              disabled={actionLoading}
              className="aura-btn aura-btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }}
            >
              {actionLoading ? 'SUBMITTING...' : 'SUBMIT RETURN REQUEST'}
            </button>
            <button
              onClick={() => setShowReturnPrompt(false)}
              className="aura-btn aura-btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
