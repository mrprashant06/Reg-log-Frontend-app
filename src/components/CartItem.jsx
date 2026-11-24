import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem, isCartLoading } = useCart();

  const handleIncrement = () => {
    if (item.availableStock && item.quantity >= item.availableStock) return;
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity <= 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div
      className="cart-item-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        gap: '1.25rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Product Image & Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1', minWidth: '240px' }}>
        <img
          src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'}
          alt={item.productName}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            objectFit: 'cover',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            flexShrink: 0,
          }}
        />

        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#06b6d4', fontWeight: 700 }}>
            {item.productBrand}
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: '0.2rem 0 0.4rem' }}>
            {item.productName}
          </h4>

          {/* Variants info */}
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
            {item.selectedSize && <span>Size: <strong style={{ color: '#e2e8f0' }}>{item.selectedSize}</strong></span>}
            {item.selectedColor && <span>Color: <strong style={{ color: '#e2e8f0' }}>{item.selectedColor}</strong></span>}
          </div>
        </div>
      </div>

      {/* Unit Price */}
      <div style={{ textAlign: 'right', minWidth: '100px' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
          {formatPrice(item.sellingPrice)}
        </div>
        {item.originalPrice && item.originalPrice > item.sellingPrice && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>
            {formatPrice(item.originalPrice)}
          </div>
        )}
      </div>

      {/* Quantity Stepper */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '0.2rem',
        }}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isCartLoading}
          style={{
            width: '32px',
            height: '32px',
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={item.quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
        >
          {item.quantity === 1 ? <Trash2 size={15} style={{ color: '#f87171' }} /> : <Minus size={15} />}
        </button>

        <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
          {item.quantity}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={isCartLoading || (item.availableStock && item.quantity >= item.availableStock)}
          style={{
            width: '32px',
            height: '32px',
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: item.availableStock && item.quantity >= item.availableStock ? 'not-allowed' : 'pointer',
          }}
          title="Increase quantity"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Item Subtotal */}
      <div style={{ textAlign: 'right', minWidth: '110px' }}>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total</div>
        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#22d3ee' }}>
          {formatPrice(item.subtotal)}
        </div>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        disabled={isCartLoading}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '0.5rem',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        title="Remove item"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
