import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { Package, Search, Plus, Check, RefreshCw } from 'lucide-react';

export default function AdminProducts() {
  const { authToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/v1/admin/products?size=50', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load inventory');
      setProducts(data.data?.content || []);
    } catch (err) {
      setError(err.message || 'Error retrieving products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [authToken]);

  const handleUpdateStock = async (id, newStock) => {
    if (newStock < 0) return;
    try {
      const response = await fetch(`/api/v1/admin/products/${id}/stock?stock=${newStock}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, availableStock: newStock, status: newStock > 10 ? 'IN_STOCK' : newStock > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK' } : p
          )
        );
      }
    } catch (err) {
      alert('Could not update stock: ' + err.message);
    }
  };

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Product & Inventory Management">
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>
            <h3 className="admin-table-title">Inventory Valuation & Margin Tracking</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Real-time Cost of Goods Sold (COGS) and profit margin per garment
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            <button onClick={fetchProducts} className="admin-btn admin-btn-outline" title="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>
            Loading inventory database...
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Cost Price (COGS)</th>
                <th>Selling Price</th>
                <th>Profit Margin</th>
                <th>Stock Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong style={{ color: '#0F172A', display: 'block' }}>{p.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.brand}</span>
                  </td>
                  <td>{p.category}</td>
                  <td style={{ color: '#64748B' }}>{formatPrice(p.costPrice)}</td>
                  <td style={{ fontWeight: 600 }}>{formatPrice(p.sellingPrice)}</td>
                  <td>
                    <span style={{ color: '#10B981', fontWeight: 600 }}>
                      +{p.marginPercent}%
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => handleUpdateStock(p.id, p.availableStock - 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 600 }}>
                        {p.availableStock}
                      </span>
                      <button
                        onClick={() => handleUpdateStock(p.id, p.availableStock + 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        p.status === 'IN_STOCK'
                          ? 'admin-badge-success'
                          : p.status === 'LOW_STOCK'
                          ? 'admin-badge-warning'
                          : 'admin-badge-danger'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
