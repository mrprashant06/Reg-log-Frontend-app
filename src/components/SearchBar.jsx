import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { getSearchSuggestions } from '../services/api';

export default function SearchBar({ onSearch, initialQuery = '', className = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const results = await getSearchSuggestions(trimmed);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    setIsOpen(false);
    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/products?query=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion);
    setIsOpen(false);
    if (onSearch) {
      onSearch(suggestion);
    } else {
      navigate(`/products?query=${encodeURIComponent(suggestion)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    if (onSearch) onSearch('');
  };

  return (
    <div ref={wrapperRef} className={`search-bar-wrapper ${className}`} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search products, brands, or luxury categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          style={{
            width: '100%',
            height: '44px',
            padding: '0 2.75rem 0 2.5rem',
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            color: '#ffffff',
            fontSize: '0.875rem',
            outline: 'none',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.2s ease',
          }}
        />
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '14px',
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            title="Clear search"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
          </button>
        )}
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className="search-suggestions-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
              Suggestions
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.65rem 1rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#e2e8f0',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Search size={14} style={{ color: '#06b6d4' }} />
                  {item}
                </span>
                <ArrowRight size={14} style={{ color: '#64748b' }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
