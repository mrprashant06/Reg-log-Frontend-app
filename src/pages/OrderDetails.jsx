import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import { getOrderById, cancelOrder, returnOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Calendar,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  MapPin,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken, isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const [reason, setReason] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getOrderById(id, authToken);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/orders/${id}` } });
      return;
    }
    fetchOrder();
  }, [id, isAuthenticated, authToken]);

  const handleCancelOrder = async () => {
    try {
      setActionLoading(true);
      await cancelOrder(order.id, reason.trim() || 'Customer requested', authToken);
      setShowCancelPrompt(false);
      setReason('');
      setActionMsg('Order successfully cancelled.');
      fetchOrder();
    } catch (err) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnOrder = async () => {
    try {
      setActionLoading(true);
      await returnOrder(order.id, reason.trim() || 'Customer return', authToken);
      setShowReturnPrompt(false);
      setReason('');
      setActionMsg('Return request submitted successfully.');
      fetchOrder();
    } catch (err) {
      setError(err.message || 'Failed to submit return request');
    } finally {
      setActionLoading(false);
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
          LOADING ORDER DETAILS...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
        <CustomerHeader />
        <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ORDER NOT FOUND
          </h2>
          <Link to="/orders" className="aura-btn aura-btn-primary" style={{ marginTop: '2rem' }}>
            BACK TO ORDERS
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent';

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
      <CustomerHeader />

      <main style={{ maxWidth: '1200px', margin: '3rem auto 6rem auto', padding: '0 2rem' }}>
        {/* Breadcrumb & Title */}
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/orders" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#707070', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            &larr; BACK TO ALL ORDERS
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.75rem', borderBottom: '1px solid #E5E5E5', paddingBottom: '1.5rem' }}>
            <div>
              <span className="aura-title-sub">ORDER REFERENCE</span>
              <h1 className="aura-title-section" style={{ margin: '0.25rem 0 0 0' }}>
                #{order.orderNumber || order.id}
              </h1>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#707070' }}>
              PLACED ON {formattedDate}
            </span>
          </div>
        </div>

        {actionMsg && (
          <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#DEF7EC', color: '#03543F', fontSize: '0.8rem', marginBottom: '2rem' }}>
            {actionMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr', gap: '4rem', alignItems: 'start' }}>
          {/* Left Column: Order Garments */}
          <div>
            <h3 style={{ fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 1.5rem 0' }}>
              PURCHASED GARMENTS ({order.items?.length || 0})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #E5E5E5' }}>
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: '1.5rem',
                    padding: '1.5rem 0',
                    borderBottom: '1px solid #E5E5E5',
                  }}
                >
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'}
                    alt={item.productName}
                    style={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover' }}
                  />
                  <div>
                    <span className="aura-product-brand">{item.productBrand || 'AURA'}</span>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 500, margin: '2px 0 6px 0' }}>
                      {item.productName}
                    </h4>
                    <div style={{ fontSize: '0.75rem', color: '#707070', display: 'flex', gap: '1rem' }}>
                      <span>Size: {item.selectedSize || 'M'}</span>
                      <span>Color: {item.selectedColor || 'Standard'}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions: Cancel & Return */}
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
              {['ORDER_PLACED', 'CONFIRMED'].includes(order.status) && (
                <button
                  onClick={() => setShowCancelPrompt(true)}
                  className="aura-btn aura-btn-secondary"
                  style={{ borderColor: '#C62828', color: '#C62828' }}
                >
                  CANCEL THIS ORDER
                </button>
              )}

              {order.status === 'DELIVERED' && (
                <button
                  onClick={() => setShowReturnPrompt(true)}
                  className="aura-btn aura-btn-secondary"
                >
                  REQUEST RETURN / EXCHANGE
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Invoice & Shipping Info */}
          <div style={{ backgroundColor: '#F7F7F7', border: '1px solid #E5E5E5', padding: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 1.5rem 0' }}>
              INVOICE SUMMARY
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', borderBottom: '1px solid #E5E5E5', paddingBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#707070' }}>Subtotal</span>
                <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#707070' }}>Delivery</span>
                <span>{order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#707070' }}>Payment Method</span>
                <span style={{ textTransform: 'uppercase' }}>{order.paymentMethod || 'SECURE'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#707070' }}>Payment Status</span>
                <span style={{ color: order.paymentStatus === 'PAID' ? '#287D46' : '#111111', fontWeight: 600 }}>
                  {order.paymentStatus || 'PENDING'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '1.5rem 0' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                TOTAL PAID
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 600 }}>
                {formatPrice(order.totalAmount)}
              </span>
            </div>

            {/* Delivery Address */}
            <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: '1.5rem', fontSize: '0.8rem' }}>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#707070', display: 'block', marginBottom: '0.5rem' }}>
                SHIPPING DESTINATION
              </span>
              <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>
                {order.shippingAddress?.fullName || 'Customer'}
              </p>
              <p style={{ margin: 0, color: '#707070', lineHeight: 1.5 }}>
                {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', color: '#707070' }}>
                Tel: {order.shippingAddress?.mobileNumber}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Prompt Modal */}
      {showCancelPrompt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', maxWidth: '450px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
              CANCEL ORDER
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#707070', marginBottom: '1.5rem' }}>
              Are you sure you wish to cancel this order? Any payments made will be reversed to the original payment source.
            </p>
            <input
              type="text"
              placeholder="Reason for cancellation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', marginBottom: '1.5rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleCancelOrder} disabled={actionLoading} className="aura-btn aura-btn-sale aura-btn-full">
                {actionLoading ? 'CANCELLING...' : 'CONFIRM CANCELLATION'}
              </button>
              <button onClick={() => setShowCancelPrompt(false)} className="aura-btn aura-btn-secondary aura-btn-full">
                KEEP ORDER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Prompt Modal */}
      {showReturnPrompt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', maxWidth: '450px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
              REQUEST RETURN
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#707070', marginBottom: '1.5rem' }}>
              Complimentary pickup will be arranged within 48 hours. Items must be unworn with tags attached.
            </p>
            <input
              type="text"
              placeholder="Reason for return"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', marginBottom: '1.5rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleReturnOrder} disabled={actionLoading} className="aura-btn aura-btn-primary aura-btn-full">
                {actionLoading ? 'SUBMITTING...' : 'SUBMIT RETURN'}
              </button>
              <button onClick={() => setShowReturnPrompt(false)} className="aura-btn aura-btn-secondary aura-btn-full">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
