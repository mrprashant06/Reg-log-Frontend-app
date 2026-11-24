import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import OrderCard from '../components/OrderCard';
import { getOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, Search, RotateCcw } from 'lucide-react';

export default function MyOrders() {
  const { authToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !authToken) return;
    try {
      setLoading(true);
      setError('');
      const data = await getOrders(
        {
          query: query.trim() || undefined,
          status: status || undefined,
          sortBy,
          page,
          size: 15,
        },
        authToken
      );
      setOrders(data.content || []);
    } catch (err) {
      setError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  }, [authToken, isAuthenticated, query, status, sortBy, page]);

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

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
      <CustomerHeader />

      <main style={{ maxWidth: '1200px', margin: '3rem auto 6rem auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid #E5E5E5', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
          <span className="aura-title-sub">ACCOUNT & PURCHASES</span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <h1 className="aura-title-section" style={{ margin: 0 }}>
              MY ORDERS ({orders.length})
            </h1>
            <Link to="/products" className="aura-link-editorial">
              SHOP NEW ARRIVALS &rarr;
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['', 'ORDER_PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatus(st);
                  setPage(0);
                }}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: status === st ? '1px solid #111111' : '1px solid #E5E5E5',
                  backgroundColor: status === st ? '#111111' : '#FFFFFF',
                  color: status === st ? '#FFFFFF' : '#111111',
                  cursor: 'pointer',
                  fontWeight: status === st ? 600 : 400,
                }}
              >
                {st === '' ? 'ALL ORDERS' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search by Order ID */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex' }}>
            <input
              type="text"
              placeholder="SEARCH BY ORDER ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.72rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                border: '1px solid #E5E5E5',
                borderRight: 'none',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="aura-btn aura-btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }}
            >
              SEARCH
            </button>
          </form>
        </div>

        {/* Orders List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem 0', color: '#707070', fontSize: '0.85rem' }}>
            LOADING PURCHASES...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <Package size={48} strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
              NO ORDERS FOUND
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#707070', maxWidth: '380px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              You do not have any orders matching your criteria. Explore our garments to place your first order.
            </p>
            <Link to="/products" className="aura-btn aura-btn-primary" style={{ padding: '0.85rem 2.5rem' }}>
              DISCOVER COLLECTION
            </Link>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                authToken={authToken}
                onOrderUpdated={fetchOrders}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
