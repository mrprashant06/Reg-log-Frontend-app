import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';
import {
  getRecommendations,
  getFeaturedProducts,
  getTopRatedProducts,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser, authToken } = useAuth();
  const navigate = useNavigate();

  const [recommended, setRecommended] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [recData, featData, topData] = await Promise.all([
          getRecommendations(8, authToken),
          getFeaturedProducts(),
          getTopRatedProducts(),
        ]);
        setRecommended(recData);
        setFeatured(featData);
        setTopRated(topData);
      } catch (err) {
        console.error('Failed to load dashboard collections:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [authToken]);

  return (
    <div className="ecommerce-page-root" style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Showcase Banner */}
      <section
        style={{
          position: 'relative',
          padding: '4rem 1.5rem 5rem',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% -20%, rgba(6, 182, 212, 0.25), transparent 70%), linear-gradient(180deg, #0b1120 0%, #070b14 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '3rem',
          }}
        >
          {/* Left Hero Content */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#22d3ee',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={15} />
              <span>Winter Luxury 2026 Collection</span>
            </div>

            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-1px',
                color: '#ffffff',
                margin: '0 0 1.25rem',
              }}
            >
              Redefining Luxury{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                E-Commerce
              </span>
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                color: '#94a3b8',
                lineHeight: 1.6,
                margin: '0 0 2rem',
                maxWidth: '540px',
              }}
            >
              Discover curated luxury essentials: Italian tailored suits, designer footwear, precision horology, and next-generation smart electronics with verified delivery.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/products"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.9rem 1.8rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <span>Explore Products</span>
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/categories"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.9rem 1.8rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  backdropFilter: 'blur(10px)',
                  transition: 'background 0.2s ease',
                }}
              >
                <span>View 10 Categories</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                height: '420px',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop"
                alt="Luxury Lifestyle Experience"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, transparent 60%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ color: '#06b6d4', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Authentic Guarantee
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                    100% Genuine Brands
                  </div>
                </div>
                <span
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                  }}
                >
                  Verified Stock
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Strip */}
      <section
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(15, 23, 42, 0.6)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '1.5rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Free Express Shipping</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>On all orders above ₹999</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Razorpay Secure Checkout</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>UPI, Cards & Cash on Delivery</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <RotateCcw size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>7-Day Easy Returns</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Hassle-free doorstep pickup</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Headphones size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Dedicated 24/7 Support</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Live assistance for orders</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.25rem 4rem' }}>
        {/* Module 1: Dynamic Categories Section */}
        <CategoryList title="Explore by Category" subtitle="Browse our 10 official product departments" />

        {/* Module 4: Personalized Recommendations */}
        <section style={{ margin: '4rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                <Zap size={14} />
                <span>Tailored Just For You</span>
              </div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: '0.25rem 0 0' }}>
                Recommended For You
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.35rem 0 0' }}>
                Rule-based picks matching your browsing taste, purchases, and popular trends
              </p>
            </div>

            <Link
              to="/products"
              style={{
                color: '#06b6d4',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>View All Products</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        {featured.length > 0 && (
          <section style={{ margin: '4rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <TrendingUp size={14} />
                  <span>Editor's Picks</span>
                </div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: '0.25rem 0 0' }}>
                  Featured Arrivals
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.35rem 0 0' }}>
                  Trending top-tier styles and high-demand tech releases
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Top Rated Collection */}
        {topRated.length > 0 && (
          <section style={{ margin: '4rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Award size={14} />
                  <span>Customer Favorites</span>
                </div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: '0.25rem 0 0' }}>
                  Top Rated Collection
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.35rem 0 0' }}>
                  Highest rated products by verified buyers across India
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {topRated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(11, 17, 33, 0.95)',
          padding: '3rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, letterSpacing: '1px' }}>AURA LUXE</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Spring Boot & MySQL Powered E-Commerce Platform
              </div>
            </div>
          </div>

          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
            © 2026 AURA LUXE Inc. All rights reserved. Razorpay Secured.
          </div>
        </div>
      </footer>
    </div>
  );
}
