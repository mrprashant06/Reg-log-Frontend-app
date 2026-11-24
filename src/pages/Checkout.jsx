import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartSummary from '../components/CartSummary';
import OrderSuccessModal from '../components/OrderSuccessModal';
import {
  getAddresses,
  addAddress,
  validateCheckout,
  placeOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  processCodPayment,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  Home,
  Briefcase,
  Building2,
  Lock,
} from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { currentUser, authToken, isAuthenticated } = useAuth();
  const { cart, refreshCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI' | 'COD'
  const [notes, setNotes] = useState('');

  // New address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: currentUser?.fullName || '',
    mobileNumber: currentUser?.phone || '',
    streetAddress: '',
    apartmentSuite: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'HOME',
    isDefault: false,
  });

  // Processing state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    async function loadCheckoutData() {
      try {
        setLoading(true);
        setErrorMsg('');
        const [addrList] = await Promise.all([
          getAddresses(authToken),
          refreshCart(),
        ]);
        setAddresses(addrList);
        if (addrList.length > 0) {
          const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to initialize checkout');
      } finally {
        setLoading(false);
      }
    }
    loadCheckoutData();
  }, [isAuthenticated, authToken, navigate, refreshCart]);

  // Handle adding a new address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.streetAddress || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      alert('Please fill out all mandatory address fields');
      return;
    }
    try {
      setSubmitting(true);
      const created = await addAddress(newAddress, authToken);
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setShowAddressModal(false);
      setNewAddress({
        fullName: currentUser?.fullName || '',
        mobileNumber: currentUser?.phone || '',
        streetAddress: '',
        apartmentSuite: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        addressType: 'HOME',
        isDefault: false,
      });
    } catch (err) {
      alert(err.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  // Place Order & Trigger Payment
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setErrorMsg('Please select or add a delivery address to proceed.');
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      // 1. Create order on Spring Boot backend with transaction & stock deduction
      const order = await placeOrder(
        {
          addressId: selectedAddressId,
          paymentMethod: paymentMethod === 'COD' ? 'COD' : 'CARD',
          notes,
        },
        authToken
      );

      // 2. Handle Payment Flow
      if (paymentMethod === 'COD') {
        // Cash on Delivery flow
        const confirmed = await processCodPayment(order.id, authToken);
        await refreshCart();
        setSuccessOrder(confirmed);
      } else {
        // Online Payment flow (Razorpay)
        const rzpData = await createRazorpayOrder(order.id, authToken);

        // Check if Razorpay SDK script is loaded in browser
        if (!window.Razorpay) {
          // If script blocked or simulated mode
          handleSimulatedVerification(order.id, rzpData.razorpayOrderId);
          return;
        }

        const options = {
          key: rzpData.keyId,
          amount: Math.round(order.totalAmount * 100),
          currency: 'INR',
          name: 'AURA LUXE',
          description: `Order #${order.orderNumber}`,
          order_id: rzpData.razorpayOrderId,
          prefill: {
            name: currentUser?.fullName || '',
            email: currentUser?.email || '',
            contact: currentUser?.phone || '',
          },
          theme: {
            color: '#06b6d4',
          },
          handler: async function (response) {
            try {
              // Verify cryptographic signature strictly on backend
              const verifiedOrder = await verifyRazorpayPayment(
                {
                  orderId: order.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
                authToken
              );
              await refreshCart();
              setSuccessOrder(verifiedOrder);
            } catch (verErr) {
              setErrorMsg('Payment verification failed on backend. Please contact support.');
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              setErrorMsg('Payment window closed. You can retry payment from My Orders.');
            },
          },
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.on('payment.failed', function (failResp) {
          setErrorMsg(`Payment failed: ${failResp.error.description || 'Transaction declined'}`);
          setSubmitting(false);
        });
        rzpInstance.open();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Order processing encountered an error');
    } finally {
      if (paymentMethod === 'COD') {
        setSubmitting(false);
      }
    }
  };

  // Fallback simulator for test mode
  const handleSimulatedVerification = async (orderId, rzpOrderId) => {
    try {
      const confirmed = await verifyRazorpayPayment(
        {
          orderId,
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: 'pay_test_' + Math.random().toString(36).substring(7),
          razorpaySignature: 'simulated_test_sig',
        },
        authToken
      );
      await refreshCart();
      setSuccessOrder(confirmed);
    } catch (err) {
      setErrorMsg(err.message || 'Payment simulation failed');
    } finally {
      setSubmitting(false);
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
        <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: '#06b6d4', margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8' }}>Verifying checkout details and stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.25rem', fontWeight: 800, marginBottom: '2rem' }}>
          Secure Checkout
        </h1>

        {errorMsg && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem',
            }}
          >
            <AlertCircle size={20} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Left Column: Address Selection & Payment Methods */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 1. Delivery Address Section */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.75rem',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', fontWeight: 700 }}>
                  <MapPin size={20} style={{ color: '#06b6d4' }} />
                  <span>1. Select Delivery Address</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    color: '#22d3ee',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={15} />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Address Cards Grid */}
              {addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                  No saved delivery addresses found. Please add an address to continue.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        style={{
                          padding: '1rem',
                          borderRadius: '14px',
                          background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <input
                            type="radio"
                            name="deliveryAddress"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr.id)}
                            style={{ marginTop: '4px', accentColor: '#06b6d4' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                              <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                                {addr.fullName || currentUser?.fullName}
                              </strong>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '9999px',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: '#cbd5e1',
                                  fontWeight: 600,
                                }}
                              >
                                {addr.addressType || 'HOME'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                              {addr.apartmentSuite ? `${addr.apartmentSuite}, ` : ''}{addr.streetAddress}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                              {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                            </div>
                            {addr.mobileNumber && (
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                Phone: {addr.mobileNumber}
                              </div>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div style={{ color: '#06b6d4' }}>
                            <Check size={20} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Payment Method Section */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.75rem',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                <CreditCard size={20} style={{ color: '#06b6d4' }} />
                <span>2. Select Payment Method</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Razorpay Online Option */}
                <div
                  onClick={() => setPaymentMethod('CARD')}
                  style={{
                    padding: '1.15rem',
                    borderRadius: '14px',
                    background: paymentMethod !== 'COD' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: paymentMethod !== 'COD' ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod !== 'COD'}
                      onChange={() => setPaymentMethod('CARD')}
                      style={{ accentColor: '#06b6d4' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                        Razorpay Payment Gateway
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Instant & Secure: Credit/Debit Cards, UPI (GPay, PhonePe, Paytm), Net Banking
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: 'rgba(6, 182, 212, 0.2)',
                      color: '#22d3ee',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '9999px',
                    }}
                  >
                    Recommended
                  </span>
                </div>

                {/* Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  style={{
                    padding: '1.15rem',
                    borderRadius: '14px',
                    background: paymentMethod === 'COD' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: paymentMethod === 'COD' ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      style={{ accentColor: '#06b6d4' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                        Cash on Delivery (COD)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Pay cash or UPI upon package delivery at your doorstep
                      </div>
                    </div>
                  </div>
                  <Banknote size={20} style={{ color: '#10b981' }} />
                </div>
              </div>

              {/* Order Notes (Optional) */}
              <div style={{ marginTop: '1.25rem' }}>
                <label style={{ fontSize: '0.825rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. Leave with security guard, landmark near metro..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Place Order Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px' }}>
            {/* Products Snapshot */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.5rem',
                backdropFilter: 'blur(20px)',
              }}
            >
              <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', margin: '0 0 1rem' }}>
                Review Products ({cart?.totalItems || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '220px', overflowY: 'auto' }}>
                {(cart?.items || []).map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.productName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Qty: {item.quantity} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#22d3ee' }}>
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <CartSummary cart={cart} showCheckoutButton={false} />

            {/* Place Order CTA Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting || !selectedAddressId || !cart?.items || cart.items.length === 0}
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                cursor: submitting || !selectedAddressId ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 30px rgba(6, 182, 212, 0.45)',
                transition: 'all 0.2s ease',
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>
                    {paymentMethod === 'COD'
                      ? `Place COD Order (${formatPrice(cart?.finalPayableAmount)})`
                      : `Pay ${formatPrice(cart?.finalPayableAmount)} with Razorpay`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 11, 20, 0.85)',
            backdropFilter: 'blur(16px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
            }}
          >
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Add Delivery Address
            </h3>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    style={modalInputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.mobileNumber}
                    onChange={(e) => setNewAddress({ ...newAddress, mobileNumber: e.target.value })}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Flat, House No., Building *</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Royal Residency"
                  value={newAddress.apartmentSuite}
                  onChange={(e) => setNewAddress({ ...newAddress, apartmentSuite: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Street Address / Area *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MG Road, Near City Mall"
                  value={newAddress.streetAddress}
                  onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    style={modalInputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    style={modalInputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Address Type</label>
                  <select
                    value={newAddress.addressType}
                    onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                    style={{ ...modalInputStyle, cursor: 'pointer' }}
                  >
                    <option value="HOME" style={{ background: '#0f172a' }}>Home</option>
                    <option value="OFFICE" style={{ background: '#0f172a' }}>Office / Work</option>
                    <option value="OTHER" style={{ background: '#0f172a' }}>Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {submitting ? 'Saving...' : 'Save & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module 9: Order Success Confirmation Modal */}
      {successOrder && (
        <OrderSuccessModal
          order={successOrder}
          onClose={() => setSuccessOrder(null)}
        />
      )}
    </div>
  );
}

const modalInputStyle = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#ffffff',
  fontSize: '0.85rem',
  outline: 'none',
  marginTop: '0.25rem',
};
