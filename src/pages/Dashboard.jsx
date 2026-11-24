import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts, getRecommendations, getCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Check } from 'lucide-react';

export default function Dashboard() {
  const { authToken } = useAuth();
  const navigate = useNavigate();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    async function fetchHomeData() {
      try {
        setLoading(true);
        const [feat, rec, cats] = await Promise.all([
          getFeaturedProducts(),
          getRecommendations(8, authToken),
          getCategories(),
        ]);
        setFeaturedProducts(feat || []);
        setRecommendedProducts(rec || []);
        setCategories(cats || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeData();
  }, [authToken]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setEmailSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setEmailSubscribed(false), 4000);
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
      {/* Top Editorial Sticky Navigation with MegaMenu */}
      <CustomerHeader />

      {/* 1. Hero Campaign Section (Zara / Massimo Dutti Editorial) */}
      <section
        className="aura-hero"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1800&auto=format&fit=crop')`,
        }}
      >
        <div className="aura-hero-overlay" />
        <div className="aura-hero-content">
          <span className="aura-hero-subtitle">AUTUMN / WINTER 2026</span>
          <h1 className="aura-hero-title">THE NEW SILHOUETTE</h1>
          <p style={{ fontSize: '1rem', letterSpacing: '0.04em', margin: '0 0 2rem 0', opacity: 0.9, maxWidth: '500px', lineHeight: 1.5 }}>
            A study in architectural minimalism, fluid drape, and timeless natural fibers crafted for modern living.
          </p>
          <div className="aura-hero-actions">
            <Link
              to="/products?gender=WOMEN"
              className="aura-btn aura-btn-white"
            >
              SHOP WOMAN
            </Link>
            <Link
              to="/products?gender=MEN"
              className="aura-btn aura-btn-white"
            >
              SHOP MAN
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Editorial Category Split Grid */}
      <section className="aura-editorial-grid">
        <Link to="/products?gender=WOMEN" className="aura-editorial-card">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
            alt="Woman Collection"
            loading="lazy"
          />
          <div className="aura-editorial-content">
            <span className="aura-title-sub" style={{ color: '#E5E5E5' }}>COLLECTION</span>
            <h3>WOMAN</h3>
            <p>Sculpted tailoring, silk slips, and organic cotton essentials.</p>
            <span className="aura-link-editorial" style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}>
              DISCOVER &rarr;
            </span>
          </div>
        </Link>

        <Link to="/products?gender=MEN" className="aura-editorial-card">
          <img
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop"
            alt="Man Collection"
            loading="lazy"
          />
          <div className="aura-editorial-content">
            <span className="aura-title-sub" style={{ color: '#E5E5E5' }}>COLLECTION</span>
            <h3>MAN</h3>
            <p>Super 130s Italian wool, crisp poplin shirts, and unstructured outerwear.</p>
            <span className="aura-link-editorial" style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}>
              DISCOVER &rarr;
            </span>
          </div>
        </Link>
      </section>

      {/* 3. "THE NEW EDIT" — Featured New Collection Grid */}
      <section style={{ maxWidth: '1600px', margin: '6rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <span className="aura-title-sub">JUST ARRIVED</span>
            <h2 className="aura-title-section" style={{ margin: '0.25rem 0 0 0' }}>THE NEW EDIT</h2>
          </div>
          <Link to="/products?sort=newest" className="aura-link-editorial">
            VIEW ALL ({featuredProducts.length || '12'}) &rarr;
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#707070', fontSize: '0.85rem' }}>
            LOADING EDITORIAL PIECES...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '2rem 1.5rem',
            }}
          >
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Editorial Mid-Campaign Banner (Full Width Atmosphere) */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1800&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          textAlign: 'center',
          color: '#FFFFFF',
          padding: '4rem 2rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.35)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '750px' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>
            STUDIO CAMPAIGN
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 300, letterSpacing: '-0.02em', textTransform: 'uppercase', margin: '0 0 1.5rem 0', lineHeight: 1 }}>
            THE MINIMALIST FORM
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.9, marginBottom: '2.5rem' }}>
            Understated garments designed with purity of line and uncompromising attention to seam, grain, and textile integrity.
          </p>
          <Link to="/products" className="aura-btn aura-btn-white">
            EXPLORE THE EDITORIAL
          </Link>
        </div>
      </section>

      {/* 5. Trending & Recommendations Section */}
      <section style={{ maxWidth: '1600px', margin: '6rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <span className="aura-title-sub">CURATED SELECTION</span>
            <h2 className="aura-title-section" style={{ margin: '0.25rem 0 0 0' }}>TRENDING THIS SEASON</h2>
          </div>
          <Link to="/products?sort=popularity" className="aura-link-editorial">
            SHOP POPULAR &rarr;
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '2rem 1.5rem',
          }}
        >
          {recommendedProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Newsletter Subscription (Minimalist Zara Single Line) */}
      <section
        style={{
          borderTop: '1px solid #E5E5E5',
          borderBottom: '1px solid #E5E5E5',
          padding: '5rem 2rem',
          backgroundColor: '#F7F7F7',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <span className="aura-title-sub">STAY CONNECTED</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0.5rem 0 1rem 0' }}>
            JOIN THE AURA COMMUNITY
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#707070', lineHeight: 1.6, marginBottom: '2rem' }}>
            Receive private preview invitations, new collection releases, and editorial lookbooks directly to your inbox.
          </p>

          {emailSubscribed ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#287D46', fontWeight: 600, fontSize: '0.85rem' }}>
              <Check size={18} /> THANK YOU FOR SUBSCRIBING. WELCOME TO AURA.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0', maxWidth: '480px', margin: '0 auto' }}>
              <input
                type="email"
                required
                placeholder="ENTER YOUR EMAIL ADDRESS"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: '1px solid #111111',
                  borderRight: 'none',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 0,
                }}
              />
              <button
                type="submit"
                className="aura-btn aura-btn-primary"
                style={{ padding: '0.85rem 1.75rem', fontSize: '0.75rem' }}
              >
                JOIN
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 7. Minimalist Editorial Footer */}
      <footer className="aura-footer">
        <div className="aura-footer-container">
          <div className="aura-footer-grid">
            <div className="aura-footer-brand">
              <h2>AURA</h2>
              <p>
                An original fashion collective dedicated to architectural cuts, refined fabrics, and minimalist everyday luxury.
              </p>
            </div>

            <div className="aura-footer-col">
              <h5>SHOPPING</h5>
              <ul>
                <li><Link to="/products?gender=WOMEN">Woman</Link></li>
                <li><Link to="/products?gender=MEN">Man</Link></li>
                <li><Link to="/products?sort=newest">New Collection</Link></li>
                <li><Link to="/products?onSale=true">Sale</Link></li>
                <li><Link to="/categories">All Categories</Link></li>
              </ul>
            </div>

            <div className="aura-footer-col">
              <h5>CUSTOMER CARE</h5>
              <ul>
                <li><Link to="/orders">Order Tracking</Link></li>
                <li><Link to="/cart">Shipping & Delivery</Link></li>
                <li><Link to="/profile">Returns & Exchanges</Link></li>
                <li><Link to="/profile">Payment Methods</Link></li>
                <li><Link to="/profile">Contact Us</Link></li>
              </ul>
            </div>

            <div className="aura-footer-col">
              <h5>SUSTAINABILITY</h5>
              <ul>
                <li><a href="#fibers">Organic Cotton</a></li>
                <li><a href="#wool">Responsible Wool</a></li>
                <li><a href="#recycling">Circular Fashion</a></li>
                <li><a href="#packaging">Eco Packaging</a></li>
              </ul>
            </div>

            <div className="aura-footer-col">
              <h5>COMPANY</h5>
              <ul>
                <li><a href="#about">About AURA</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#press">Press & Media</a></li>
                <li><a href="#stores">Store Locator</a></li>
              </ul>
            </div>
          </div>

          <div className="aura-footer-bottom">
            <span>&copy; {new Date().getFullYear()} AURA FASHION GROUP. ALL RIGHTS RESERVED.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>PRIVACY POLICY</a>
              <a href="#terms" style={{ color: 'inherit', textDecoration: 'none' }}>PURCHASE CONDITIONS</a>
              <a href="#cookies" style={{ color: 'inherit', textDecoration: 'none' }}>COOKIES SETTINGS</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
