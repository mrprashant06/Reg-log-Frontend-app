import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, X, Menu, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import MegaMenu from './MegaMenu';

export default function CustomerHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="aura-header">
        <div className="aura-header-container">
          {/* Mobile Menu Button */}
          <button
            className="aura-header-icon-btn d-md-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ display: 'none' }}
            aria-label="Toggle Navigation"
          >
            <Menu size={20} />
          </button>

          {/* Left Navigation: Fashion Categories */}
          <nav className="aura-nav-left">
            <span
              className={`aura-nav-item ${activeTab === 'WOMAN' ? 'active' : ''}`}
              onMouseEnter={() => setActiveTab('WOMAN')}
              onClick={() => navigate('/products?gender=WOMEN')}
            >
              WOMAN
            </span>
            <span
              className={`aura-nav-item ${activeTab === 'MAN' ? 'active' : ''}`}
              onMouseEnter={() => setActiveTab('MAN')}
              onClick={() => navigate('/products?gender=MEN')}
            >
              MAN
            </span>
            <span
              className={`aura-nav-item ${activeTab === 'NEW COLLECTION' ? 'active' : ''}`}
              onMouseEnter={() => setActiveTab('NEW COLLECTION')}
              onClick={() => navigate('/products?sort=newest')}
            >
              NEW COLLECTION
            </span>
            <span
              className={`aura-nav-item sale ${activeTab === 'SALE' ? 'active' : ''}`}
              onMouseEnter={() => setActiveTab('SALE')}
              onClick={() => navigate('/products?onSale=true')}
            >
              SALE
            </span>
          </nav>

          {/* Center: Brand Logo */}
          <Link to="/" className="aura-brand-logo" onMouseEnter={() => setActiveTab(null)}>
            AURA
          </Link>

          {/* Right Navigation: Actions */}
          <div className="aura-nav-right" onMouseEnter={() => setActiveTab(null)}>
            {/* Search Trigger */}
            <button
              className="aura-header-icon-btn"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search Collection"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            {/* Wishlist Link with Badge */}
            <Link to="/wishlist" className="aura-header-icon-btn" aria-label="Wishlist">
              <Heart size={19} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="aura-icon-badge">{wishlistCount}</span>
              )}
            </Link>

            {/* Shopping Bag Link with Badge */}
            <Link to="/cart" className="aura-header-icon-btn" aria-label="Shopping Bag">
              <ShoppingBag size={19} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="aura-icon-badge">{totalItems}</span>
              )}
            </Link>

            {/* Account Profile / Login */}
            <div style={{ position: 'relative' }}>
              <button
                className="aura-header-icon-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User Account"
              >
                <User size={19} strokeWidth={1.5} />
              </button>

              {isUserMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '230px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E5E5',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    padding: '1rem',
                    zIndex: 1100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  {isAuthenticated ? (
                    <>
                      <div style={{ borderBottom: '1px solid #E5E5E5', paddingBottom: '0.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>{user?.fullName || 'Customer'}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#707070' }}>{user?.email || user?.phone}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#2563EB',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            padding: '4px 0',
                          }}
                        >
                          <Shield size={16} /> Admin Portal
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{ color: '#111111', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        My Account
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{ color: '#111111', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        Orders & Tracking
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{ color: '#111111', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        Saved Wishlist ({wishlistCount})
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          borderTop: '1px solid #E5E5E5',
                          paddingTop: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.8rem',
                          color: '#C62828',
                          cursor: 'pointer',
                        }}
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#707070' }}>
                        Sign in for personalized recommendations and order tracking.
                      </p>
                      <Link
                        to="/login"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="aura-btn aura-btn-primary aura-btn-full"
                        style={{ padding: '0.6rem 1rem', fontSize: '0.75rem' }}
                      >
                        LOG IN
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="aura-btn aura-btn-secondary aura-btn-full"
                        style={{ padding: '0.6rem 1rem', fontSize: '0.75rem' }}
                      >
                        REGISTER
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MegaMenu Drawer */}
        <MegaMenu activeTab={activeTab} onClose={() => setActiveTab(null)} />
      </header>

      {/* Zara Minimalist Full-Screen Search Overlay */}
      {isSearchOpen && (
        <div className="aura-search-overlay">
          <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <button
              className="aura-search-close-btn"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="aura-search-bar-wrap">
            <input
              type="text"
              autoFocus
              className="aura-search-input"
              placeholder="ENTER WHAT YOU ARE LOOKING FOR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="aura-header-icon-btn">
              <Search size={24} strokeWidth={1.5} />
            </button>
          </form>

          <div style={{ maxWidth: '900px', margin: '2rem auto 0 auto', width: '100%' }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#707070' }}>
              POPULAR SEARCHES
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {['Merino Wool', 'Maxi Dress', 'Linen Shirt', 'Leather Boots', 'Cashmere Sweater', 'Denim'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate(`/products?keyword=${encodeURIComponent(term)}`);
                  }}
                  style={{
                    background: 'none',
                    border: '1px solid #E5E5E5',
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
