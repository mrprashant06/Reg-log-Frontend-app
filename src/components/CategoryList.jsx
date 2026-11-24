import React, { useState, useEffect } from 'react';
import { getCategories } from '../services/api';
import CategoryCard from './CategoryCard';
import { Loader2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function CategoryList({ title = 'Curated Collections', subtitle = 'Explore luxury products by category' }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to MySQL database to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <section className="categories-section" style={{ margin: '3rem 0' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Layers size={14} />
            <span>Featured Departments</span>
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: '0.25rem 0 0' }}>
            {title}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.35rem 0 0' }}>
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={loadCategories}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1',
            padding: '0.45rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                height: '240px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                animation: 'pulse 1.8s infinite ease-in-out',
              }}
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div
          style={{
            padding: '1.75rem',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            color: '#fca5a5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={22} className="shrink-0" />
            <div>
              <div style={{ fontWeight: 600 }}>Error loading categories</div>
              <div style={{ fontSize: '0.85rem', color: '#f87171' }}>{error}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={loadCategories}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Responsive Categories Grid */}
      {!loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </section>
  );
}
