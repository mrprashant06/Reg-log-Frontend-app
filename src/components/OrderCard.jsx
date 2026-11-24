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
  CreditCard,
  MapPin,
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
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent';

  // Status Badge Colors & Icons
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ORDER_PLACED':
        return { label: 'Order Placed', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', icon: Clock };
      case 'CONFIRMED':
        return { label: 'Confirmed', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: CheckCircle2 };
      case 'PROCESSING':
        return { label: 'Processing', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', icon: Package };
      case 'SHIPPED':
        return { label: 'Shipped', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Truck };
      case 'OUT_FOR_DELIVERY':
        return { label: 'Out for Delivery', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', icon: Truck };
      case 'DELIVERED':
        return { label: 'Delivered', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle2 };
      case 'CANCELLED':
        return { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: XCircle };
      case 'RETURNED':
        return { label: 'Return Requested', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', icon: RotateCcw };
      default:
        return { label: status, color: '#94a3b8', bg: 'rgba(255, 255, 255, 0.08)', icon: Package };
    }
  };

  const statusInfo = getStatusBadge(order.orderStatus);
  const StatusIcon = statusInfo.icon;

  const isCancellable = order.orderStatus === 'ORDER_PLACED' || order.orderStatus === 'CONFIRMED';
  const isReturnable = order.orderStatus === 'DELIVERED';

  const handleCancel = async () => {
    if (!reason.trim()) {
      setActionError('Please provide a reason for cancellation');
      return;
    }
    try {
      setActionLoading(true);
      setActionError('');
      await cancelOrder(order.id, reason.trim(), authToken);
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
    if (!reason.trim()) {
      setActionError('Please provide a reason for return');
      return;
    }
    try {
      setActionLoading(true);
      setActionError('');
      await returnOrder(order.id, reason.trim(), authToken);
      setShowReturnPrompt(false);
      setReason('');
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      setActionError(err.message || 'Failed to submit return request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="order-card-wrapper"
      style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.035)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Order Summary Header Bar */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.7)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Order Number
            </div>
            <div style={{ fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace', fontSize: '0.95rem' }}>
              #{order.orderNumber}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Order Date</div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{formattedDate}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Amount</div>
            <div style={{ fontWeight: 800, color: '#22d3ee', fontSize: '1.05rem' }}>
              {formatPrice(order.totalAmount)}
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '9999px',
              background: statusInfo.bg,
              color: statusInfo.color,
              fontSize: '0.8rem',
              fontWeight: 700,
              border: `1px solid ${statusInfo.color}35`,
            }}
          >
            <StatusIcon size={14} />
            <span>{statusInfo.label}</span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              color: '#cbd5e1',
              padding: '0.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title={expanded ? 'Collapse' : 'Expand order details'}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Main Order Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
          {(order.items || []).map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'}
                  alt={item.productName}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#06b6d4', fontWeight: 700 }}>
                    {item.productBrand}
                  </div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.925rem' }}>
                    {item.productName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', gap: '0.6rem', marginTop: '0.2rem' }}>
                    <span>Qty: <strong style={{ color: '#e2e8f0' }}>{item.quantity}</strong></span>
                    {item.selectedSize && <span>Size: <strong style={{ color: '#e2e8f0' }}>{item.selectedSize}</strong></span>}
                    {item.selectedColor && <span>Color: <strong style={{ color: '#e2e8f0' }}>{item.selectedColor}</strong></span>}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>
                  {formatPrice(item.totalPrice)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  ({formatPrice(item.unitPrice)} each)
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Collapsible Deep Details */}
        {expanded && (
          <div
            style={{
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            {/* Delivery Address Snapshot */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.4rem' }}>
                <MapPin size={15} />
                <span>Shipping Address</span>
              </div>
              <div style={{ color: '#ffffff', fontWeight: 600 }}>{order.shippingFullName}</div>
              <div style={{ color: '#cbd5e1' }}>
                {order.shippingApartmentSuite ? `${order.shippingApartmentSuite}, ` : ''}{order.shippingStreetAddress}
              </div>
              <div style={{ color: '#94a3b8' }}>
                {order.shippingCity}, {order.shippingState} - {order.shippingPostalCode}
              </div>
              {order.shippingMobileNumber && (
                <div style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Phone: {order.shippingMobileNumber}</div>
              )}
            </div>

            {/* Payment & Logistics Info */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#34d399', marginBottom: '0.4rem' }}>
                <CreditCard size={15} />
                <span>Payment & Logistics</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: '#94a3b8' }}>Payment Method:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{order.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: '#94a3b8' }}>Payment Status:</span>
                <span style={{ color: order.paymentStatus === 'PAID' ? '#34d399' : '#f59e0b', fontWeight: 700 }}>
                  {order.paymentStatus}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Delivery ETA:</span>
                <span style={{ color: '#cbd5e1' }}>{order.estimatedDeliveryInfo || '3-5 Days'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls: Details, Cancel, Return */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            flexWrap: 'wrap',
          }}
        >
          {isCancellable && (
            <button
              type="button"
              onClick={() => setShowCancelPrompt(true)}
              disabled={actionLoading}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel Order
            </button>
          )}

          {isReturnable && (
            <button
              type="button"
              onClick={() => setShowReturnPrompt(true)}
              disabled={actionLoading}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                background: 'rgba(236, 72, 153, 0.12)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                color: '#f472b6',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Request Return
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(`/orders/${order.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              color: '#22d3ee',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Eye size={14} />
            <span>Track Order</span>
          </button>
        </div>

        {/* Action Error */}
        {actionError && (
          <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'right' }}>
            {actionError}
          </div>
        )}

        {/* Cancel Prompt Dialog */}
        {showCancelPrompt && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            <div style={{ fontWeight: 600, color: '#f87171', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
              Confirm Cancellation for Order #{order.orderNumber}
            </div>
            <input
              type="text"
              placeholder="Reason for cancellation (e.g. Changed mind, ordered by mistake)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                marginBottom: '0.6rem',
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowCancelPrompt(false);
                  setReason('');
                }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={actionLoading}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  background: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        )}

        {/* Return Prompt Dialog */}
        {showReturnPrompt && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(236, 72, 153, 0.08)',
              border: '1px solid rgba(236, 72, 153, 0.25)',
            }}
          >
            <div style={{ fontWeight: 600, color: '#f472b6', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
              Request Return for Order #{order.orderNumber}
            </div>
            <input
              type="text"
              placeholder="Reason for return (e.g. Size didn't fit, item defective)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                marginBottom: '0.6rem',
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowReturnPrompt(false);
                  setReason('');
                }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleReturn}
                disabled={actionLoading}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  background: '#ec4899',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {actionLoading ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
