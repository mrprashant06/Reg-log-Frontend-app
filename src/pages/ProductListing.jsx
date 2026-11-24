import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import ProductCard from '../components/ProductCard';
import { getProducts, getFilterOptions } from '../services/api';
import { SlidersHorizontal, X, Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pageData, setPageData] = useState({
    page: 0,
    size: 16,
    totalElements: 0,
    totalPages: 0,
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    brands: [],
    colors: [],
    sizes: [],
    genders: [],
    minPrice: 0,
    maxPrice: 50000,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [columnCount, setColumnCount] = useState(4); // 2, 3, or 4

  // URL query params
  const keyword = searchParams.get('keyword') || searchParams.get('query') || '';
  const categorySlug = searchParams.get('categorySlug') || searchParams.get('category') || '';
  const gender = searchParams.get('gender') || '';
  const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedSize = searchParams.get('size') || '';
  const selectedColor = searchParams.get('color') || '';
  const onSale = searchParams.get('onSale') === 'true';

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const apiParams = {
        keyword: keyword || undefined,
        categorySlug: categorySlug || undefined,
        gender: gender || undefined,
        sortBy: sortBy,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        brand: selectedBrand || undefined,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        onSale: onSale || undefined,
        page: 0,
        size: 24,
      };

      const [res, opts] = await Promise.all([
        getProducts(apiParams),
        getFilterOptions(),
      ]);

      setProducts(res.content || []);
      setPageData({
        page: res.page || 0,
        size: res.size || 24,
        totalElements: res.totalElements || 0,
        totalPages: res.totalPages || 1,
      });
      if (opts) setFilterOptions(opts);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Unable to retrieve collection');
    } finally {
      setLoading(false);
    }
  }, [keyword, categorySlug, gender, sortBy, minPrice, maxPrice, selectedBrand, selectedSize, selectedColor, onSale]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val === undefined || val === null || val === '') {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const getPageTitle = () => {
    if (keyword) return `SEARCH: "${keyword.toUpperCase()}"`;
    if (gender) return `${gender.toUpperCase()} COLLECTION`;
    if (onSale) return 'SEASON END SALE';
    if (categorySlug) return categorySlug.replace('-', ' ').toUpperCase();
    return 'ALL GARMENTS';
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
      <CustomerHeader />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>
        {/* Zara Editorial Catalog Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E5E5E5',
            paddingBottom: '1.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span className="aura-title-sub">COLLECTION</span>
            <h1 className="aura-title-section" style={{ margin: '0.25rem 0 0 0' }}>
              {getPageTitle()}
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#707070', letterSpacing: '0.05em' }}>
              {pageData.totalElements} ITEMS
            </span>
          </div>

          {/* Controls: Filter Button, Layout Toggle, Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Filter Drawer Toggle */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="aura-btn aura-btn-secondary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.72rem' }}
            >
              <SlidersHorizontal size={14} />
              {isFilterOpen ? 'HIDE FILTERS' : 'FILTERS'}
            </button>

            {/* Column Layout Switch (Desktop) */}
            <div style={{ display: 'flex', gap: '4px', border: '1px solid #E5E5E5', padding: '2px' }}>
              <button
                onClick={() => setColumnCount(2)}
                style={{
                  background: columnCount === 2 ? '#111111' : 'transparent',
                  color: columnCount === 2 ? '#FFFFFF' : '#111111',
                  border: 'none',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                title="2 Columns"
              >
                <Grid2X2 size={16} />
              </button>
              <button
                onClick={() => setColumnCount(3)}
                style={{
                  background: columnCount === 3 ? '#111111' : 'transparent',
                  color: columnCount === 3 ? '#FFFFFF' : '#111111',
                  border: 'none',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                title="3 Columns"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setColumnCount(4)}
                style={{
                  background: columnCount === 4 ? '#111111' : 'transparent',
                  color: columnCount === 4 ? '#FFFFFF' : '#111111',
                  border: 'none',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                title="4 Columns"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              style={{
                padding: '0.65rem 1.25rem',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: '1px solid #E5E5E5',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="newest">SORT BY: NEWEST</option>
              <option value="price_low">PRICE: LOW TO HIGH</option>
              <option value="price_high">PRICE: HIGH TO LOW</option>
              <option value="popularity">POPULARITY</option>
              <option value="discount">GREATEST DISCOUNT</option>
            </select>
          </div>
        </div>

        {/* Collapsible Minimalist Filter Drawer */}
        {isFilterOpen && (
          <div
            style={{
              backgroundColor: '#F7F7F7',
              border: '1px solid #E5E5E5',
              padding: '2rem',
              marginBottom: '2.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Gender Filter */}
            <div>
              <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
                DEPARTMENT
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['WOMEN', 'MEN', 'UNISEX'].map((g) => (
                  <button
                    key={g}
                    onClick={() => updateParam('gender', gender === g ? '' : g)}
                    style={{
                      background: gender === g ? '#111111' : '#FFFFFF',
                      color: gender === g ? '#FFFFFF' : '#111111',
                      border: '1px solid #E5E5E5',
                      padding: '6px 12px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
                SIZE
              </h4>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateParam('size', selectedSize === s ? '' : s)}
                    style={{
                      background: selectedSize === s ? '#111111' : '#FFFFFF',
                      color: selectedSize === s ? '#FFFFFF' : '#111111',
                      border: '1px solid #E5E5E5',
                      padding: '6px 10px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      minWidth: '36px',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
                MAX PRICE (₹{maxPrice || '50,000'})
              </h4>
              <input
                type="range"
                min="999"
                max="50000"
                step="500"
                value={maxPrice || 50000}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                style={{ width: '100%', accentColor: '#111111', cursor: 'pointer' }}
              />
            </div>

            {/* Clear All Actions */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={clearAllFilters}
                className="aura-btn aura-btn-secondary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.72rem' }}
              >
                CLEAR ALL FILTERS
              </button>
            </div>
          </div>
        )}

        {/* Product Catalog Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem 0', color: '#707070', fontSize: '0.85rem' }}>
            LOADING COLLECTION...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
              NO MATCHING GARMENTS FOUND
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#707070', marginBottom: '2rem' }}>
              Try adjusting your filter options or searching for a different keyword.
            </p>
            <button onClick={clearAllFilters} className="aura-btn aura-btn-primary">
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                columnCount === 2
                  ? 'repeat(2, 1fr)'
                  : columnCount === 3
                  ? 'repeat(3, 1fr)'
                  : 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '2.5rem 1.5rem',
            }}
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
