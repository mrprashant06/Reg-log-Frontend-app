import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrderById, cancelOrder, returnOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Calendar,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  MapPin,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'ORDER_PLACED', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken, isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/orders/${id}` } });
      return;
    }

    async function loadOrder() {
      try {
        setLoading(true);
        setError('');
        const data = await getOrderById(id, authToken);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to find order');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, authToken, isAuthenticated, navigate]);

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const getStepIndex = (statusKey) => {
    if (statusKey === 'CANCELLED' || statusKey === 'RETURNED') return -1;
    return STATUS_STEPS.findIndex((s) => s.key === statusKey);
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 0;
  const isCancellable = order && (order.orderStatus === 'ORDER_PLACED' || order.orderStatus === 'CONFIRMED');
  const isReturnable = order && order.orderStatus === 'DELIVERED';

  const handleCancel = async () => {
    if (!reason.trim()) {
      alert('Please specify reason for cancellation');
      return;
    }
    try {
      setActionLoading(true);
      const updated = await cancelOrder(order.id, reason.trim(), authToken);
      setOrder(updated);
      setCancelModalOpen(false);
      setReason('');
      setActionMsg('Order successfully cancelled.');
    } catch (err) {
      alert(err.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!reason.trim()) {
      alert('Please specify reason for return');
      return;
    }
    try {
      setActionLoading(true);
      const updated = await returnOrder(order.id, reason.trim(), authToken);
      setOrder(updated);
      setReturnModalOpen(false);
      setReason('');
      setActionMsg('Return request submitted.');
    } catch (err) {
      alert(err.message || 'Return request failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: '#06b6d4', margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8' }}>Loading order tracking status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2>Order Not Found</h2>
          <p style={{ color: '#94a3b8', margin: '0.5rem 0 1.5rem' }}>{error}</p>
          <Link to="/orders" style={{ display: 'inline-flex', padding: '0.65rem 1.5rem', borderRadius: '10px', background: '#06b6d4', color: '#ffffff', textDecoration: 'none', fontWeight: 600 }}>
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
      <Navbar />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
        {/* Top Back Link */}
        <Link
          to="/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Orders</span>
        </Link>

        {/* Order Header Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2rem',
            backdropFilter: 'blur(20px)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Order Summary & Tracking
              </div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0 0' }}>
                Order #{order.orderNumber}
              </h1>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Placed on {formattedDate}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Payable</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#22d3ee' }}>
                {formatPrice(order.totalAmount)}
              </div>
            </div>
          </div>

          {actionMsg && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
              {actionMsg}
            </div>
          )}

          {/* Visual Order Tracking Progress Bar */}
          {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'RETURNED' ? (
            <div style={{ margin: '2rem 0 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div
                      key={step.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: 1,
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isDone ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)',
                          color: isDone ? '#0b1120' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          boxShadow: isCurrent ? '0 0 20px #06b6d4' : 'none',
                          border: isCurrent ? '2px solid #ffffff' : 'none',
                        }}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: isDone ? '#f8fafc' : '#64748b',
                          fontWeight: isCurrent ? 700 : 500,
                          marginTop: '0.5rem',
                          textAlign: 'center',
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}

                {/* Background Line Connector */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '8%',
                    right: '8%',
                    height: '2px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    zIndex: 1,
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                background: order.orderStatus === 'CANCELLED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                border: `1px solid ${order.orderStatus === 'CANCELLED' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(236, 72, 153, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: order.orderStatus === 'CANCELLED' ? '#f87171' : '#f472b6',
              }}
            >
              {order.orderStatus === 'CANCELLED' ? <XCircle size={24} /> : <RotateCcw size={24} />}
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {order.orderStatus === 'CANCELLED' ? 'Order Cancelled' : 'Return In Progress'}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  Reason: {order.cancellationReason || order.returnReason || 'Customer requested'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Info: Items List & Snapshot Receipt */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Purchased Items */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '1.75rem',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1.25rem' }}>
              Items in this Shipment ({order.items?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(order.items || []).map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#06b6d4', textTransform: 'uppercase', fontWeight: 700 }}>
                        {item.productBrand}
                      </div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                        {item.productName}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                        Qty: {item.quantity} {item.selectedSize ? `• Size ${item.selectedSize}` : ''} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics & Payment Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Delivery Address Snapshot */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem' }}>
                <MapPin size={17} />
                <span>Delivery Address</span>
              </div>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>{order.shippingFullName}</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                {order.shippingApartmentSuite ? `${order.shippingApartmentSuite}, ` : ''}{order.shippingStreetAddress}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                {order.shippingCity}, {order.shippingState} - {order.shippingPostalCode}, {order.shippingCountry}
              </div>
              {order.shippingMobileNumber && (
                <div style={{ color: '#94a3b8', fontSize: '0.825rem', marginTop: '0.4rem' }}>
                  Phone: {order.shippingMobileNumber}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.5rem',
              }}
            >
              <h4 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1rem' }}>Payment Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                    <span>Discount</span>
                    <span>- {formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Delivery Charges</span>
                  <span>{order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}</span>
                </div>
                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '0.4rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: '#22d3ee' }}>
                  <span>Total Paid</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {isCancellable && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#f87171',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel Order
                </button>
              )}

              {isReturnable && (
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(true)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: 'rgba(236, 72, 153, 0.15)',
                    border: '1px solid rgba(236, 72, 153, 0.35)',
                    color: '#f472b6',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Request Return
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#f87171' }}>Cancel Order #{order.orderNumber}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Stock will be returned to inventory and order status updated to CANCELLED.
            </p>
            <textarea
              rows={3}
              placeholder="Why are you cancelling this order?..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={textareaStyle}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setCancelModalOpen(false)} style={btnSecondaryStyle}>
                Dismiss
              </button>
              <button type="button" onClick={handleCancel} disabled={actionLoading} style={btnDangerStyle}>
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#f472b6' }}>Request Return for Order #{order.orderNumber}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Our courier will schedule a doorstep quality check and return pickup.
            </p>
            <textarea
              rows={3}
              placeholder="Reason for returning this item..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={textareaStyle}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setReturnModalOpen(false)} style={btnSecondaryStyle}>
                Dismiss
              </button>
              <button type="button" onClick={handleReturn} disabled={actionLoading} style={{ ...btnDangerStyle, background: '#ec4899' }}>
                {actionLoading ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(7, 11, 20, 0.85)',
  backdropFilter: 'blur(16px)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.25rem',
};

const modalBoxStyle = {
  width: '100%',
  maxWidth: '480px',
  background: '#0f172a',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '20px',
  padding: '1.75rem',
  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
};

const textareaStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#ffffff',
  fontSize: '0.85rem',
  outline: 'none',
  resize: 'none',
};

const btnSecondaryStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  background: 'none',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#cbd5e1',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

const btnDangerStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  background: '#ef4444',
  border: 'none',
  color: '#ffffff',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '0.85rem',
};
