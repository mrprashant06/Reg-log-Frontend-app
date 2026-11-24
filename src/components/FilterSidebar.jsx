import React, { useState, useEffect } from 'react';
import { Filter, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export default function FilterSidebar({
  filterOptions,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  totalProducts = 0,
}) {
  const [minPrice, setMinPrice] = useState(selectedFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(selectedFilters.maxPrice || '');

  useEffect(() => {
    setMinPrice(selectedFilters.minPrice || '');
    setMaxPrice(selectedFilters.maxPrice || '');
  }, [selectedFilters.minPrice, selectedFilters.maxPrice]);

  const handlePriceApply = () => {
    onFilterChange({
      ...selectedFilters,
      minPrice: minPrice !== '' ? minPrice : null,
      maxPrice: maxPrice !== '' ? maxPrice : null,
      page: 0,
    });
  };

  const handleCheckboxToggle = (filterKey, value) => {
    const current = selectedFilters[filterKey] || [];
    let updated;
    if (current.includes(value)) {
      updated = current.filter((item) => item !== value);
    } else {
      updated = [...current, value];
    }
    onFilterChange({
      ...selectedFilters,
      [filterKey]: updated,
      page: 0,
    });
  };

  const handleGenderSelect = (gender) => {
    const updated = selectedFilters.gender === gender ? null : gender;
    onFilterChange({
      ...selectedFilters,
      gender: updated,
      page: 0,
    });
  };

  const handleCategoryToggle = (catId) => {
    const current = selectedFilters.categoryIds || [];
    let updated;
    if (current.includes(catId)) {
      updated = current.filter((id) => id !== catId);
    } else {
      updated = [...current, catId];
    }
    onFilterChange({
      ...selectedFilters,
      categoryIds: updated,
      categoryId: null,
      page: 0,
    });
  };

  return (
    <aside
      className="filter-sidebar"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '1.5rem',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
          <Filter size={18} style={{ color: '#06b6d4' }} />
          <span>Filters</span>
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
          title="Clear all filters"
        >
          <RotateCcw size={13} />
          <span>Clear All</span>
        </button>
      </div>

      {/* 1. Price Filter */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '0.75rem' }}>
          Price Range (₹)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{
              padding: '0.45rem 0.6rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{
              padding: '0.45rem 0.6rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>
        <button
          type="button"
          onClick={handlePriceApply}
          style={{
            width: '100%',
            padding: '0.45rem',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            color: '#22d3ee',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Apply Price
        </button>
      </div>

      {/* 2. Gender Filter */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '0.75rem' }}>
          Gender
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {['MEN', 'WOMEN', 'UNISEX', 'KIDS'].map((g) => {
            const isSelected = selectedFilters.gender === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => handleGenderSelect(g)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  background: isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.06)',
                  border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isSelected ? '#0b1120' : '#cbd5e1',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Category Filter */}
      {filterOptions.categories && filterOptions.categories.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '0.75rem' }}>
            Categories
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
            {filterOptions.categories.map((cat) => {
              const isChecked = (selectedFilters.categoryIds || []).includes(cat.id) || selectedFilters.categoryId === cat.id;
              return (
                <label
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.825rem',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(isChecked)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    style={{ accentColor: '#06b6d4', width: '15px', height: '15px' }}
                  />
                  <span>{cat.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Brand Filter */}
      {filterOptions.brands && filterOptions.brands.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '0.75rem' }}>
            Brands
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
            {filterOptions.brands.map((brand) => {
              const isChecked = (selectedFilters.brands || []).includes(brand);
              return (
                <label
                  key={brand}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.825rem',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxToggle('brands', brand)}
                    style={{ accentColor: '#06b6d4', width: '15px', height: '15px' }}
                  />
                  <span>{brand}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Colors Filter */}
      {filterOptions.colors && filterOptions.colors.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '0.75rem' }}>
            Colours
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {filterOptions.colors.map((c) => {
              const isSelected = (selectedFilters.colors || []).includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCheckboxToggle('colors', c)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: isSelected ? '#22d3ee' : '#cbd5e1',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Sizes Filter */}
      {filterOptions.sizes && filterOptions.sizes.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '0.75rem' }}>
            Sizes
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {filterOptions.sizes.map((s) => {
              const isSelected = (selectedFilters.sizes || []).includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleCheckboxToggle('sizes', s)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: isSelected ? '#60a5fa' : '#cbd5e1',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
