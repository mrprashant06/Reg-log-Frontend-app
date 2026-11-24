import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { getProducts, getFilterOptions } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PackageSearch,
  ArrowUpDown,
} from 'lucide-react';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { authToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [pageData, setPageData] = useState({
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    isLast: true,
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    brands: [],
    colors: [],
    sizes: [],
    genders: [],
    minPrice: 0,
    maxPrice: 100000,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Extract filters from URL
  const currentQuery = searchParams.get('query') || '';
  const currentCategoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null;
  const currentCategorySlug = searchParams.get('categorySlug') || '';
  const currentSortBy = searchParams.get('sortBy') || 'newest';
  const currentPage = Number(searchParams.get('page') || 0);

  const [filters, setFilters] = useState({
    query: currentQuery,
    categoryId: currentCategoryId,
    categorySlug: currentCategorySlug,
    minPrice: searchParams.get('minPrice') || null,
    maxPrice: searchParams.get('maxPrice') || null,
    brands: searchParams.getAll('brands') || [],
    colors: searchParams.getAll('colors') || [],
    sizes: searchParams.getAll('sizes') || [],
    categoryIds: searchParams.getAll('categoryIds').map(Number) || [],
    gender: searchParams.get('gender') || null,
    sortBy: currentSortBy,
    page: currentPage,
    size: 12,
  });

  // Sync state when URL params change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      query: searchParams.get('query') || '',
      categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null,
      categorySlug: searchParams.get('categorySlug') || '',
      minPrice: searchParams.get('minPrice') || null,
      maxPrice: searchParams.get('maxPrice') || null,
      brands: searchParams.getAll('brands') || [],
      colors: searchParams.getAll('colors') || [],
      sizes: searchParams.getAll('sizes') || [],
      categoryIds: searchParams.getAll('categoryIds').map(Number) || [],
      gender: searchParams.get('gender') || null,
      sortBy: searchParams.get('sortBy') || 'newest',
      page: Number(searchParams.get('page') || 0),
    }));
  }, [searchParams]);

  // Load filter options once
  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await getFilterOptions();
        setFilterOptions(meta);
      } catch (err) {
        console.warn('Failed to load filter metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch filtered products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProducts(filters, authToken);
      setProducts(data.content || []);
      setPageData({
        page: data.page,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        isLast: data.last,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, authToken]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL search params
  const updateParams = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.query) params.set('query', newFilters.query);
    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId);
    if (newFilters.categorySlug) params.set('categorySlug', newFilters.categorySlug);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.gender) params.set('gender', newFilters.gender);
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.page > 0) params.set('page', newFilters.page);

    (newFilters.brands || []).forEach((b) => params.append('brands', b));
    (newFilters.colors || []).forEach((c) => params.append('colors', c));
    (newFilters.sizes || []).forEach((s) => params.append('sizes', s));
    (newFilters.categoryIds || []).forEach((id) => params.append('categoryIds', id));

    setSearchParams(params);
  };

  const handleFilterChange = (updated) => {
    setFilters(updated);
    updateParams(updated);
  };

  const handleClearFilters = () => {
    const reset = {
      query: '',
      categoryId: null,
      categorySlug: '',
      minPrice: null,
      maxPrice: null,
      brands: [],
      colors: [],
      sizes: [],
      categoryIds: [],
      gender: null,
      sortBy: 'newest',
      page: 0,
      size: 12,
    };
    setFilters(reset);
    setSearchParams(new URLSearchParams());
  };

  const removeTag = (tagType, value) => {
    let updated = { ...filters, page: 0 };
    if (tagType === 'query') updated.query = '';
    if (tagType === 'gender') updated.gender = null;
    if (tagType === 'price') {
      updated.minPrice = null;
      updated.maxPrice = null;
    }
    if (tagType === 'brand') updated.brands = filters.brands.filter((b) => b !== value);
    if (tagType === 'color') updated.colors = filters.colors.filter((c) => c !== value);
    if (tagType === 'size') updated.sizes = filters.sizes.filter((s) => s !== value);
    if (tagType === 'category') {
      updated.categoryIds = filters.categoryIds.filter((id) => id !== value);
      if (updated.categoryId === value) updated.categoryId = null;
    }
    handleFilterChange(updated);
  };

  const hasActiveFilters = Boolean(
    filters.query ||
      filters.gender ||
      filters.minPrice ||
      filters.maxPrice ||
      (filters.brands && filters.brands.length > 0) ||
      (filters.colors && filters.colors.length > 0) ||
      (filters.sizes && filters.sizes.length > 0) ||
      (filters.categoryIds && filters.categoryIds.length > 0) ||
      filters.categoryId
  );

  return (
    <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        {/* Top Header & Sort Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
              {filters.query ? `Search results for "${filters.query}"` : 'Explore All Products'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
              Showing {products.length} of {pageData.totalElements} verified luxury products
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="mobile-filter-trigger"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={16} />
              <span>Filter</span>
            </button>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpDown size={16} style={{ color: '#06b6d4' }} />
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value, page: 0 })}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="newest" style={{ background: '#0f172a' }}>Sort by: Newest Arrivals</option>
                <option value="price_low" style={{ background: '#0f172a' }}>Sort by: Price Low to High</option>
                <option value="price_high" style={{ background: '#0f172a' }}>Sort by: Price High to Low</option>
                <option value="popular" style={{ background: '#0f172a' }}>Sort by: Most Popular</option>
                <option value="rating" style={{ background: '#0f172a' }}>Sort by: Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Removable Active Filter Tags */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Active filters:</span>

            {filters.query && (
              <span className="filter-chip">
                Query: "{filters.query}"
                <X size={13} onClick={() => removeTag('query')} />
              </span>
            )}
            {filters.gender && (
              <span className="filter-chip">
                Gender: {filters.gender}
                <X size={13} onClick={() => removeTag('gender')} />
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="filter-chip">
                Price: ₹{filters.minPrice || 0} - ₹{filters.maxPrice || 'Any'}
                <X size={13} onClick={() => removeTag('price')} />
              </span>
            )}
            {filters.brands.map((b) => (
              <span key={b} className="filter-chip">
                Brand: {b}
                <X size={13} onClick={() => removeTag('brand', b)} />
              </span>
            ))}
            {filters.colors.map((c) => (
              <span key={c} className="filter-chip">
                Color: {c}
                <X size={13} onClick={() => removeTag('color', c)} />
              </span>
            ))}
            {filters.sizes.map((s) => (
              <span key={s} className="filter-chip">
                Size: {s}
                <X size={13} onClick={() => removeTag('size', s)} />
              </span>
            ))}
          </div>
        )}

        {/* 2-Column Catalog Grid: Filters Sidebar + Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Desktop Filter Sidebar */}
          <div className="catalog-sidebar-desktop">
            <FilterSidebar
              filterOptions={filterOptions}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              totalProducts={pageData.totalElements}
            />
          </div>

          {/* Product Items Content */}
          <div>
            {/* Loading Indicator */}
            {loading && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: '380px',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      animation: 'pulse 1.8s infinite ease-in-out',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Error Banner */}
            {error && !loading && (
              <div
                style={{
                  padding: '2rem',
                  borderRadius: '16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  textAlign: 'center',
                  color: '#f87171',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Failed to Load Products</div>
                <div style={{ fontSize: '0.875rem' }}>{error}</div>
                <button
                  type="button"
                  onClick={fetchProducts}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '20px',
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                }}
              >
                <PackageSearch size={48} style={{ color: '#06b6d4', margin: '0 auto 1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>No Matching Products Found</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  We could not find any luxury products matching your active filters or search keyword. Try clearing some filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '1.5rem',
                  }}
                >
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pageData.totalPages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      marginTop: '3rem',
                    }}
                  >
                    <button
                      type="button"
                      disabled={pageData.page === 0}
                      onClick={() => handleFilterChange({ ...filters, page: pageData.page - 1 })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: pageData.page === 0 ? '#475569' : '#ffffff',
                        cursor: pageData.page === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>

                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                      Page {pageData.page + 1} of {pageData.totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={pageData.isLast}
                      onClick={() => handleFilterChange({ ...filters, page: pageData.page + 1 })}
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
              </>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.65rem;
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.35);
          color: #22d3ee;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .filter-chip svg {
          cursor: pointer;
        }
        @media (max-width: 900px) {
          .catalog-sidebar-desktop {
            display: none !important;
          }
          .mobile-filter-trigger {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
