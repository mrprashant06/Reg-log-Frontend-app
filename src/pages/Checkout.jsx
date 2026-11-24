import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
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
  X,
} from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, authToken, isAuthenticated } = useAuth();
  const { cart, refreshCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'COD'
  const [notes, setNotes] = useState('');

  // New address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.fullName || '',
    mobileNumber: user?.phone || '',
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

        await validateCheckout(authToken);
        const addrList = await getAddresses(authToken);
        setAddresses(addrList || []);

        if (addrList && addrList.length > 0) {
          const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Checkout verification failed');
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, [isAuthenticated, authToken, navigate]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');
      const saved = await addAddress(newAddress, authToken);
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressId(saved.id);
      setShowAddressModal(false);
      setNewAddress({
        fullName: user?.fullName || '',
        mobileNumber: user?.phone || '',
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
      setErrorMsg(err.message || 'Failed to save shipping address');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setErrorMsg('Please select or add a shipping address');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      // 1. Create order on Spring Boot backend
      const order = await placeOrder(
        {
          shippingAddressId: selectedAddressId,
          paymentMethod: paymentMethod,
          notes: notes,
        },
        authToken
      );

      // 2. Handle Payment
      if (paymentMethod === 'COD') {
        const confirmed = await processCodPayment(order.id, authToken);
        await refreshCart();
        setSuccessOrder(confirmed);
      } else {
        // Online Payment flow (Razorpay)
        const rzpData = await createRazorpayOrder(order.id, authToken);

        if (!window.Razorpay) {
          // If script blocked or simulated mode
          handleSimulatedVerification(order.id, rzpData.razorpayOrderId);
          return;
        }

        const options = {
          key: rzpData.keyId,
          amount: Math.round(order.totalAmount * 100),
          currency: 'INR',
          name: 'AURA',
          description: `Order #${order.orderNumber || order.id}`,
          order_id: rzpData.razorpayOrderId,
          prefill: {
            name: user?.fullName || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: {
            color: '#111111',
          },
          handler: async function (response) {
            try {
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

  const handleSimulatedVerification = async (orderId, rzpOrderId) => {
    try {
      const confirmed = await verifyRazorpayPayment(
        {
          orderId,
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: 'pay_sim_' + Math.random().toString(36).substring(7),
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
          VERIFYING CHECKOUT DETAILS...
        </div>
      </div>
    );
  }

  const subtotal = cart?.subtotal || 0;
  const deliveryCharge = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const totalAmount = subtotal + deliveryCharge;

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
      <CustomerHeader />

      <main style={{ maxWidth: '1400px', margin: '3rem auto 6rem auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid #E5E5E5', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
          <span className="aura-title-sub">SECURE PAYMENT</span>
          <h1 className="aura-title-section" style={{ margin: '0.25rem 0 0 0' }}>
            CHECKOUT
          </h1>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: '#FDE8E8',
              borderLeft: '3px solid #C62828',
              color: '#C62828',
              fontSize: '0.82rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 0.9fr',
            gap: '4rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Multi-Step Flow */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Step 1: Shipping Address */}
            <div style={{ borderBottom: '1px solid #E5E5E5', paddingBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                  1. SHIPPING ADDRESS
                </h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="aura-btn aura-btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.7rem' }}
                >
                  <Plus size={13} /> ADD NEW ADDRESS
                </button>
              </div>

              {addresses.length === 0 ? (
                <div style={{ padding: '2rem', backgroundColor: '#F7F7F7', textAlign: 'center', fontSize: '0.82rem', color: '#707070' }}>
                  No shipping addresses found. Please add an address to continue.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        style={{
                          padding: '1.25rem',
                          border: isSelected ? '2px solid #111111' : '1px solid #E5E5E5',
                          backgroundColor: isSelected ? '#FFFFFF' : '#F7F7F7',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{addr.fullName}</span>
                          <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#707070' }}>
                            {addr.addressType || 'HOME'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#707070', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>
                          {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: '#111111' }}>
                          Tel: {addr.mobileNumber}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Delivery Options */}
            <div style={{ borderBottom: '1px solid #E5E5E5', paddingBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 1.25rem 0' }}>
                2. DELIVERY METHOD
              </h3>
              <div
                style={{
                  padding: '1.25rem',
                  border: '1px solid #111111',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
                    STANDARD COURIER DELIVERY
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#707070' }}>
                    Estimated delivery: 2 - 4 business days
                  </span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                </span>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div>
              <h3 style={{ fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 1.25rem 0' }}>
                3. PAYMENT METHOD
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Razorpay Card / UPI */}
                <div
                  onClick={() => setPaymentMethod('CARD')}
                  style={{
                    padding: '1.25rem',
                    border: paymentMethod === 'CARD' ? '2px solid #111111' : '1px solid #E5E5E5',
                    backgroundColor: paymentMethod === 'CARD' ? '#FFFFFF' : '#F7F7F7',
                    cursor: 'pointer',
                  }}
                >
                  <CreditCard size={20} strokeWidth={1.5} style={{ marginBottom: '0.75rem' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>
                    RAZORPAY SECURE
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#707070' }}>
                    Cards, UPI, Netbanking & Wallets
                  </span>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  style={{
                    padding: '1.25rem',
                    border: paymentMethod === 'COD' ? '2px solid #111111' : '1px solid #E5E5E5',
                    backgroundColor: paymentMethod === 'COD' ? '#FFFFFF' : '#F7F7F7',
                    cursor: 'pointer',
                  }}
                >
                  <Banknote size={20} strokeWidth={1.5} style={{ marginBottom: '0.75rem' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>
                    CASH ON DELIVERY
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#707070' }}>
                    Pay in cash upon garment receipt
                  </span>
                </div>
              </div>

              {/* Delivery Notes */}
              <div>
                <label style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#707070', display: 'block', marginBottom: '0.5rem' }}>
                  SPECIAL DELIVERY INSTRUCTIONS (OPTIONAL)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Leave with building security or ring front buzzer"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                    border: '1px solid #E5E5E5',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    resize: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Pane */}
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
              ORDER SUMMARY ({cart?.totalItems || 0} ITEMS)
            </h3>

            {/* Item Previews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {cart?.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'}
                    alt={item.productName}
                    style={{ width: '48px', height: '64px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 500, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.productName}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#707070' }}>
                      Qty: {item.quantity} | {item.selectedSize || 'M'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#707070' }}>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#707070' }}>Delivery</span>
                <span>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span>
              </div>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #E5E5E5', paddingTop: '1.25rem', margin: '1.25rem 0' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                TOTAL PAYABLE
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 600 }}>
                {formatPrice(totalAmount)}
              </span>
            </div>

            {/* Confirm Purchase Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="aura-btn aura-btn-primary aura-btn-full"
              style={{ padding: '1rem', fontSize: '0.8rem' }}
            >
              {submitting ? 'PROCESSING ORDER...' : 'AUTHORISE PAYMENT & ORDER'}
            </button>

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#707070' }}>
              <ShieldCheck size={14} />
              <span>Payments processed via 256-bit PCI-DSS compliant vault</span>
            </div>
          </div>
        </div>
      </main>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
          onClick={() => setShowAddressModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              maxWidth: '520px',
              width: '100%',
              padding: '2.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                NEW SHIPPING ADDRESS
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddNewAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                required
                placeholder="FULL NAME"
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
              />

              <input
                type="tel"
                required
                placeholder="CONTACT MOBILE NUMBER"
                value={newAddress.mobileNumber}
                onChange={(e) => setNewAddress({ ...newAddress, mobileNumber: e.target.value })}
                style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
              />

              <input
                type="text"
                required
                placeholder="STREET ADDRESS / BUILDING / SUITE"
                value={newAddress.streetAddress}
                onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  required
                  placeholder="CITY"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
                />
                <input
                  type="text"
                  required
                  placeholder="STATE"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  required
                  placeholder="POSTAL CODE / PIN"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                  style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
                />
                <select
                  value={newAddress.addressType}
                  onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                  style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none', backgroundColor: '#FFFFFF' }}
                >
                  <option value="HOME">HOME</option>
                  <option value="WORK">WORK</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="aura-btn aura-btn-primary aura-btn-full"
                style={{ marginTop: '1rem', padding: '0.85rem' }}
              >
                SAVE AND USE ADDRESS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confetti Celebration Modal with Exact 5-Second Countdown Auto-Redirect */}
      {successOrder && (
        <OrderSuccessModal
          order={successOrder}
          onClose={() => navigate('/orders')}
        />
      )}
    </div>
  );
}
