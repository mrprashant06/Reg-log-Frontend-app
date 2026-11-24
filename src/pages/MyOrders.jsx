import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OrderCard from '../components/OrderCard';
import { getOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Search,
  Filter,
  RotateCcw,
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
  ShoppingBag,
} from 'lucide-react';

export default function MyOrders() {
  const { currentUser, authToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);

  const [pageData, setPageData] = useState({
    totalElements: 0,
    totalPages: 0,
    isLast: true,
  });

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !authToken) return;
    try {
      setLoading(true);
      setError('');
      const data = await getOrders(
        {
          query: query.trim() || undefined,
          status: status || undefined,
          paymentMethod: paymentMethod || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortBy,
          page,
          size: 10,
        },
        authToken
      );
      setOrders(data.content || []);
      setPageData({
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        isLast: data.last,
      });
    } catch (err) {
      setError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  }, [authToken, isAuthenticated, query, status, paymentMethod, startDate, endDate, sortBy, page]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    fetchOrders();
  }, [isAuthenticated, fetchOrders, navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchOrders();
  };

  const handleResetFilters = () => {
    setQuery('');
    setStatus('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
    setPage(0);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
        {/* Title Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.35rem' }}>
            My Orders
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Manage, track, cancel, and review all your purchases
          </p>
        </div>

        {/* Filters & Search Control Bar */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.035)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '1.25rem',
            backdropFilter: 'blur(20px)',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Top Row: Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search by Order ID (e.g. AURA-...), Product Title, or Brand..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 1rem 0 2.5rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <Search size={17} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
            </div>

            <button
              type="submit"
              style={{
                padding: '0 1.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Search
            </button>
          </form>

          {/* Bottom Row: Status Filter, Payment Filter, Dates & Sorting */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            {/* Order Status */}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
                style={filterSelectStyle}
              >
                <option value="" style={{ background: '#0f172a' }}>All Statuses</option>
                <option value="ORDER_PLACED" style={{ background: '#0f172a' }}>Order Placed</option>
                <option value="CONFIRMED" style={{ background: '#0f172a' }}>Confirmed</option>
                <option value="PROCESSING" style={{ background: '#0f172a' }}>Processing</option>
                <option value="SHIPPED" style={{ background: '#0f172a' }}>Shipped</option>
                <option value="OUT_FOR_DELIVERY" style={{ background: '#0f172a' }}>Out for Delivery</option>
                <option value="DELIVERED" style={{ background: '#0f172a' }}>Delivered</option>
                <option value="CANCELLED" style={{ background: '#0f172a' }}>Cancelled</option>
                <option value="RETURNED" style={{ background: '#0f172a' }}>Returned</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setPage(0);
                }}
                style={filterSelectStyle}
              >
                <option value="" style={{ background: '#0f172a' }}>All Payment Modes</option>
                <option value="CARD" style={{ background: '#0f172a' }}>Card / Online</option>
                <option value="UPI" style={{ background: '#0f172a' }}>UPI</option>
                <option value="COD" style={{ background: '#0f172a' }}>Cash on Delivery</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
                style={filterSelectStyle}
              />
            </div>

            {/* End Date */}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
                style={filterSelectStyle}
              />
            </div>

            {/* Sorting */}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(0);
                }}
                style={filterSelectStyle}
              >
                <option value="newest" style={{ background: '#0f172a' }}>Newest to Oldest</option>
                <option value="oldest" style={{ background: '#0f172a' }}>Oldest to Newest</option>
                <option value="price_high" style={{ background: '#0f172a' }}>Price: High to Low</option>
                <option value="price_low" style={{ background: '#0f172a' }}>Price: Low to High</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: '#06b6d4', margin: '0 auto 1rem' }} />
            <p style={{ color: '#94a3b8' }}>Loading your orders from database...</p>
          </div>
        )}

        {/* Error Banner */}
        {error && !loading && (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '24px',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
            }}
          >
            <Package size={56} style={{ color: '#06b6d4', margin: '0 auto 1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem' }}>No Orders Found</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              We could not find any orders matching your criteria. Start shopping to place your first luxury order!
            </p>
            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              <ShoppingBag size={17} />
              <span>Explore Products</span>
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                authToken={authToken}
                onOrderUpdated={fetchOrders}
              />
            ))}

            {/* Pagination Controls */}
            {pageData.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  marginTop: '2rem',
                }}
              >
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: page === 0 ? '#475569' : '#ffffff',
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                  Page {page + 1} of {pageData.totalPages}
                </span>

                <button
                  type="button"
                  disabled={pageData.isLast}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: pageData.isLast ? '#475569' : '#ffffff',
                    cursor: pageData.isLast ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const filterSelectStyle = {
  width: '100%',
  height: '38px',
  padding: '0 0.65rem',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: '#ffffff',
  fontSize: '0.825rem',
  outline: 'none',
  cursor: 'pointer',
};
